const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Fix: Update intent classifier to separate STUDY from medication questions
const oldStudyIntent = "STUDY - medical education (explain, pathophysiology, mechanism, treatment protocol, diagnosis of, what is, how does, anatomy, pharmacology)";
const newStudyIntent = "STUDY - ONLY when user explicitly asks to learn/study medical theory (explain pathophysiology, explain mechanism, explain anatomy, teach me about, study mode). Keywords: explain, pathophysiology, mechanism, anatomy, teach\nMEDICATION - asking about taking medicine, drug interactions, dosage, can I take (can I take, should I take, is it safe to take, medicine for, drug for, tablet for)";

content = content.replace(oldStudyIntent, newStudyIntent);

// Add MEDICATION route
const oldStudyRoute = "  // 📚 SLOW PATH — Medical Study (deep knowledge needed)\n  if (intent === 'STUDY') {";
const newMedRoute = `  // 💊 FAST PATH — Medication questions
  if (intent === 'MEDICATION') {
    console.log('💊 FAST PATH → LLaMA 3.3 70b — Medication');
    return { model: 'llama-3.3-70b-versatile', path: 'FAST', reason: 'medication' };
  }

  // 📚 SLOW PATH — Medical Study (deep knowledge needed)
  if (intent === 'STUDY') {`;

content = content.replace(oldStudyRoute, newMedRoute);

// Fix: Use SYSTEM_PROMPT for MEDICATION not STUDY_PROMPT
const oldBasePrompt = "const basePrompt = intentResult.intent === 'STUDY' ? STUDY_PROMPT : SYSTEM_PROMPT;";
const newBasePrompt = "const basePrompt = intentResult.intent === 'STUDY' ? STUDY_PROMPT : SYSTEM_PROMPT;";

fs.writeFileSync('backend/server.js', content);
console.log('Done! Intent classifier updated with MEDICATION intent');