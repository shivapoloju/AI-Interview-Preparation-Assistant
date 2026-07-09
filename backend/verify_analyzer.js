import { analyzeResponse } from './analyzer.js';

const sampleAnswers = [
  // Nervous, hesitant, short answer
  "Um, I think I, like, really struggle with, you know, sort of managing large databases. It is probably, uh, difficult for me, so yeah.",
  
  // Confident, professional, rich answer
  "I spearheaded the design and implementation of a scalable microservices architecture that resolved our database bottlenecks. This successfully optimized query latency by 45% and improved overall developer productivity through clear API contracts. I am highly confident in my design patterns and collaboration skills.",
  
  // Empty answer
  ""
];

console.log("=== STARTING NLP ANALYZER DRY-RUN VERIFICATION ===\n");

sampleAnswers.forEach((ans, idx) => {
  console.log(`--- Test Case ${idx + 1}: "${ans || '[EMPTY]'}" ---`);
  const metrics = analyzeResponse(ans);
  console.log("Word Count:", metrics.wordCount);
  console.log("Filler Count:", metrics.fillerCount);
  console.log("Filler %:", metrics.fillerPercentage + "%");
  console.log("Filler Breakdown:", JSON.stringify(metrics.fillerBreakdown));
  console.log("Lexical Diversity:", metrics.lexicalDiversity, `(${metrics.vocabularyRating})`);
  console.log("Pace (Est. Seconds):", metrics.estimatedPaceSeconds, `(${metrics.paceRating})`);
  console.log("Tone & Confidence Score:", metrics.confidenceScore, `(${metrics.toneRating})`);
  console.log("Suggestions:", metrics.suggestions);
  console.log("\n");
});

console.log("=== VERIFICATION COMPLETE ===");
