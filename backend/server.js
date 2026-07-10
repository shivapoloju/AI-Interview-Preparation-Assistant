import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { analyzeResponse } from './analyzer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper to get OpenAI Client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  return new OpenAI({ apiKey });
}

// 1. Start a Session
app.post('/api/sessions', async (req, res) => {
  try {
    const { role, level, category, jobDescription, maxQuestions = 5 } = req.body;
    
    let openai;
    try {
      openai = getOpenAIClient();
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        return res.status(401).json({ error: 'OpenAI API Key is missing. Please configure it in your backend environment.' });
      }
      throw err;
    }

    const systemPrompt = `You are a professional hiring manager and expert interviewer.
Your task is to conduct a realistic, professional, and conversational mock interview for the candidate.
Role: ${level} ${role}
Interview Category: ${category}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the first realistic, challenging, and suitable interview question. Do NOT include any introduction like "Hello, welcome to your interview." Just output the question itself. Keep the question under 50 words.' }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const firstQuestion = response.choices[0].message.content.trim();
    const sessionId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    
    const session = {
      id: sessionId,
      role,
      level,
      category,
      jobDescription: jobDescription || '',
      maxQuestions: parseInt(maxQuestions) || 5,
      currentQuestionIndex: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'in_progress',
      questions: [
        {
          question: firstQuestion,
          answer: null,
          score: null,
          feedback: null,
          modelAnswer: null,
          communication: null
        }
      ]
    };

    fs.writeFileSync(path.join(DATA_DIR, `${sessionId}.json`), JSON.stringify(session, null, 2));
    res.status(201).json(session);
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start interview session. ' + error.message });
  }
});

// 2. Submit Answer for Current Question
app.post('/api/sessions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (session.status !== 'in_progress') {
      return res.status(400).json({ error: 'Session is already finished' });
    }

    let openai;
    try {
      openai = getOpenAIClient();
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        return res.status(401).json({ error: 'OpenAI API Key is missing. Please configure it in your backend environment.' });
      }
      throw err;
    }

    const currentIdx = session.currentQuestionIndex;
    const currentQ = session.questions[currentIdx].question;

    // Run local communication & NLP analysis (filler words, pace, lexical diversity, tone)
    const communicationMetrics = analyzeResponse(answer);

    // Prompt OpenAI for answer evaluation and next question generation
    const isLastQuestion = currentIdx + 1 >= session.maxQuestions;

    const evaluationPrompt = `You are a professional interviewer for the role: ${session.level} ${session.role} (${session.category} category).
You just asked: "${currentQ}"
The candidate answered: "${answer}"

Evaluate the candidate's answer based on professional standards, factual accuracy, and technical/behavioral depth.
${isLastQuestion ? 'This is the last question of the interview. Do NOT generate a next question (leave the "nextQuestion" property empty).' : 'Generate the next realistic and progressive interview question.'}

Provide your response in JSON format. The response must follow this schema:
{
  "score": <integer from 0 to 100 evaluating content depth and correctness>,
  "strengths": "<brief summary of what they did well>",
  "weaknesses": "<brief summary of what was missing or incorrect>",
  "improvement": "<actionable recommendation for how to improve this answer>",
  "modelAnswer": "<an exemplar model answer in STAR format for behavioral, or structural bullet points for technical/system design>",
  "nextQuestion": "${isLastQuestion ? '' : '<the next question for the candidate, keep it under 50 words>'}"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: evaluationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const evalJsonText = response.choices[0].message.content;
    let evaluation;
    try {
      evaluation = JSON.parse(evalJsonText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON output:', evalJsonText);
      // Fallback evaluation structure if JSON parse fails
      evaluation = {
        score: 70,
        strengths: 'Provided a direct response.',
        weaknesses: 'Evaluation parsing error occurred.',
        improvement: 'Try to articulate details with structure.',
        modelAnswer: 'N/A',
        nextQuestion: isLastQuestion ? '' : 'Can you explain another project you worked on recently?'
      };
    }

    // Save answer and analysis to current question
    session.questions[currentIdx].answer = answer;
    session.questions[currentIdx].score = evaluation.score;
    session.questions[currentIdx].feedback = {
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      improvement: evaluation.improvement
    };
    session.questions[currentIdx].modelAnswer = evaluation.modelAnswer;
    session.questions[currentIdx].communication = communicationMetrics;

    // Check if we should advance or end
    if (isLastQuestion) {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
    } else {
      session.currentQuestionIndex += 1;
      session.questions.push({
        question: evaluation.nextQuestion || 'Could you elaborate more on your background?',
        answer: null,
        score: null,
        feedback: null,
        modelAnswer: null,
        communication: null
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    res.json(session);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to process response. ' + error.message });
  }
});

// 3. End Session & Generate Final Report
app.post('/api/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Force complete if currently in progress
    if (session.status === 'in_progress') {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
    }

    let openai;
    try {
      openai = getOpenAIClient();
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        return res.status(401).json({ error: 'OpenAI API Key is missing. Please configure it in your backend environment.' });
      }
      throw err;
    }

    // Gather history
    const completedQA = session.questions.filter(q => q.answer !== null);
    
    if (completedQA.length === 0) {
      session.finalReport = {
        overallScore: 0,
        summary: 'No questions were answered during this interview session.',
        keyStrengths: [],
        keyWeaknesses: [],
        actionablePlan: ['Ensure you answer questions in the next session to receive feedback.']
      };
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
      return res.json(session);
    }

    const historyPromptText = completedQA.map((q, idx) => {
      return `Q${idx+1}: ${q.question}\nA${idx+1}: ${q.answer}\nScore: ${q.score}/100\nFeedback: ${q.feedback?.improvement}\n`;
    }).join('\n');

    const finalReportPrompt = `You are a professional HR Director and Executive Coach.
Review the candidate's complete performance in this mock interview for the role: ${session.level} ${session.role} (${session.category} category).

Here is the log of questions, answers, and scores:
${historyPromptText}

Provide an aggregated, strategic evaluation of their performance. Focus on content, technical depth, logic, and style.
Provide your response in JSON format. The response must follow this schema:
{
  "overallScore": <integer from 0 to 100, summarizing their total performance>,
  "summary": "<a high-quality, professional paragraph summarizing their performance, strengths, and areas of promise>",
  "keyStrengths": [
    "<strength 1: what they did exceptionally well across the interview>",
    "<strength 2: another key strength>"
  ],
  "keyWeaknesses": [
    "<weakness 1: major theme where they fell short or missed key details>",
    "<weakness 2: another key weakness>"
  ],
  "actionablePlan": [
    "<step 1: specific practice advice>",
    "<step 2: specific topic or framework to study>",
    "<step 3: concrete communication practice step>"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: finalReportPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    const reportJsonText = response.choices[0].message.content;
    let finalReport;
    try {
      finalReport = JSON.parse(reportJsonText);
    } catch (parseError) {
      console.error('Failed to parse final report JSON:', reportJsonText);
      // Fallback
      const scores = completedQA.map(q => q.score || 70);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      finalReport = {
        overallScore: avgScore,
        summary: 'Completed the mock interview successfully. Great effort practicing.',
        keyStrengths: ['Completed the questions and attempted all responses.'],
        keyWeaknesses: ['Struggled to articulate structured answers in some responses.'],
        actionablePlan: ['Use structural frameworks like STAR.', 'Familiarize yourself with role-specific keywords.']
      };
    }

    session.finalReport = finalReport;
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    res.json(session);
  } catch (error) {
    console.error('Error generating final report:', error);
    res.status(500).json({ error: 'Failed to generate final report. ' + error.message });
  }
});

// 4. Get List of Sessions (History)
app.get('/api/sessions', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
    const sessions = files.map(file => {
      try {
        const filePath = path.join(DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Return thin summaries for the list view
        const completedQA = data.questions.filter(q => q.answer !== null).length;
        return {
          id: data.id,
          role: data.role,
          level: data.level,
          category: data.category,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          questionsCount: data.questions.length,
          completedQuestionsCount: completedQA,
          overallScore: data.finalReport?.overallScore || null
        };
      } catch (err) {
        console.error('Error reading session file:', file, err);
        return null;
      }
    }).filter(Boolean);

    // Sort by start time descending
    sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    res.json(sessions);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions list.' });
  }
});

// 5. Get Specific Session
app.get('/api/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
});

// 6. Delete Session
app.delete('/api/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Session deleted successfully.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express Server running on port ${PORT}`);
});
