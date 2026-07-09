/**
 * Communication & NLP Analyzer for Mock Interview Responses
 * Performs static analysis on text to measure communication quality.
 */

const FILLER_WORDS = [
  'like', 'um', 'uh', 'basically', 'actually', 
  'you know', 'so', 'literally', 'mean', 'sort of', 'kind of'
];

const CONFIDENT_WORDS = [
  'achieved', 'led', 'managed', 'created', 'built', 'implemented', 
  'resolved', 'improved', 'success', 'effective', 'collaborated', 
  'designed', 'delivered', 'optimized', 'solved', 'spearheaded',
  'learned', 'growth', 'impact', 'results', 'confident', 'passionate'
];

const HESITANT_WORDS = [
  'maybe', 'probably', 'unsure', 'might', 'guess', 'dont know', "don't know",
  'difficult', 'struggled', 'struggling', 'worried', 'confused', 'hopefully',
  'sort of', 'kind of', 'i think', 'think i'
];

export function analyzeResponse(text) {
  if (!text || typeof text !== 'string') {
    return {
      wordCount: 0,
      fillerCount: 0,
      fillerPercentage: 0,
      fillerBreakdown: {},
      lexicalDiversity: 0,
      vocabularyRating: 'N/A',
      estimatedPaceSeconds: 0,
      paceRating: 'N/A',
      sentenceCount: 0,
      avgSentenceLength: 0,
      sentenceRating: 'N/A',
      confidenceScore: 0,
      toneRating: 'N/A',
      suggestions: ['Please provide an answer to get communication feedback.']
    };
  }

  // 1. Word Count & Tokenization
  const cleanedText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanedText.toLowerCase().split(' ').filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return analyzeResponse(''); // Return empty state
  }

  // 2. Filler Words Tracking
  const lowercaseText = text.toLowerCase();
  let fillerCount = 0;
  const fillerBreakdown = {};

  FILLER_WORDS.forEach(filler => {
    // Match word boundaries for fillers. For phrases like "you know", handle spaces
    const escapedFiller = filler.replace(' ', '\\s+');
    const regex = new RegExp(`\\b${escapedFiller}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const count = matches.length;
      fillerCount += count;
      fillerBreakdown[filler] = count;
    } else {
      fillerBreakdown[filler] = 0;
    }
  });

  const fillerPercentage = parseFloat(((fillerCount / wordCount) * 100).toFixed(1));

  // 3. Lexical Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words);
  const lexicalDiversity = parseFloat((uniqueWords.size / wordCount).toFixed(2));
  
  let vocabularyRating = 'Standard';
  if (wordCount > 15) {
    if (lexicalDiversity > 0.65) {
      vocabularyRating = 'Rich and Varied';
    } else if (lexicalDiversity < 0.45) {
      vocabularyRating = 'Repetitive';
    }
  }

  // 4. Estimated Speaking Pace
  // Average conversational speech is 130-150 words per minute.
  // We'll assume 140 WPM as base.
  const estimatedPaceSeconds = Math.round((wordCount / 140) * 60);
  let paceRating = 'Good';
  if (wordCount < 15) {
    paceRating = 'Too Brief';
  } else if (wordCount > 300) {
    paceRating = 'Verbose/Long';
  }

  // 5. Sentences & Readability
  // Split by sentence terminators
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const sentenceCount = sentences.length || 1;
  const avgSentenceLength = parseFloat((wordCount / sentenceCount).toFixed(1));
  
  let sentenceRating = 'Clear';
  if (wordCount > 15) {
    if (avgSentenceLength > 24) {
      sentenceRating = 'Run-on Sentences';
    } else if (avgSentenceLength < 8) {
      sentenceRating = 'Choppy Sentences';
    }
  }

  // 6. Tone & Confidence Scoring
  let confidentMatches = 0;
  let hesitantMatches = 0;

  CONFIDENT_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) confidentMatches += matches.length;
  });

  HESITANT_WORDS.forEach(word => {
    const escaped = word.replace("'", "'?");
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) hesitantMatches += matches.length;
  });

  // Calculate base score
  let confidenceScore = 75;
  confidenceScore += Math.min(confidentMatches * 4, 15); // Add up to 15 points
  confidenceScore -= Math.min(hesitantMatches * 5, 20);  // Subtract up to 20 points
  confidenceScore -= Math.min(fillerCount * 2, 20);      // Subtract up to 20 points for fillers
  
  // Cap between 30 and 100
  confidenceScore = Math.max(30, Math.min(100, confidenceScore));

  let toneRating = 'Professional & Balanced';
  if (confidenceScore >= 85) {
    toneRating = 'Highly Confident';
  } else if (confidenceScore < 60) {
    toneRating = 'Hesitant / Nervous';
  }

  // 7. Dynamic Actionable Suggestions
  const suggestions = [];
  
  if (fillerPercentage > 10) {
    suggestions.push("Try to pause instead of using filler words. You used fillers in " + fillerPercentage + "% of your response.");
  } else if (fillerPercentage > 5) {
    suggestions.push("Minor filler word usage detected. Work on breathing and pacing to eliminate them completely.");
  }

  if (paceRating === 'Too Brief') {
    suggestions.push("Expand your answer. Use the STAR method (Situation, Task, Action, Result) to give concrete details of your experience.");
  } else if (paceRating === 'Verbose/Long') {
    suggestions.push("This answer is quite long (over 300 words). Try to edit down your response to be more concise and hit your key points directly.");
  }

  if (sentenceRating === 'Run-on Sentences') {
    suggestions.push("Break up your long sentences. Shorter, punchier sentences are easier for interviewers to follow.");
  } else if (sentenceRating === 'Choppy Sentences') {
    suggestions.push("Try to connect your thoughts with transitions (e.g. 'furthermore', 'consequently') to make your flow smoother.");
  }

  if (lexicalDiversity < 0.45 && wordCount > 20) {
    suggestions.push("Expand your vocabulary. Try using synonyms instead of repeating the same action verbs.");
  }

  if (hesitantMatches > 2) {
    suggestions.push("Replace tentative phrasing (like 'I think', 'maybe', 'probably') with more definitive statements (e.g. 'I led', 'I am confident in').");
  }

  if (confidentMatches === 0 && wordCount > 20) {
    suggestions.push("Integrate more strong action verbs (e.g. 'delivered', 'optimized', 'resolved') to highlight your direct contributions.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Excellent structure and tone! Your communication is clear, confident, and professional.");
  }

  return {
    wordCount,
    fillerCount,
    fillerPercentage,
    fillerBreakdown,
    lexicalDiversity,
    vocabularyRating,
    estimatedPaceSeconds,
    paceRating,
    sentenceCount,
    avgSentenceLength,
    sentenceRating,
    confidenceScore,
    toneRating,
    suggestions
  };
}
