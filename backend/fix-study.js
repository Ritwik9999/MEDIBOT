const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// STEP 1: Add STUDY_PROMPT after SYSTEM_PROMPT
const studyPrompt = `

const STUDY_PROMPT = \`You are Dr. MediBot Professor Mode — a world-class medical professor with expertise across all medical specialties.

When a medical student asks a question:
1. Start with a clear, simple definition
2. Explain the pathophysiology step by step
3. List the etiology (causes)
4. Describe clinical features and symptoms
5. Explain diagnostic approach and investigations
6. Describe treatment protocols (pharmacological + non-pharmacological)
7. Mention complications if untreated
8. Add recent research findings when relevant
9. Use mnemonics to help remember
10. End with a clinical pearl or exam tip

Sources: Harrison Internal Medicine, Robbins Pathology, Guyton Physiology, Davidson Medicine, Bailey and Love Surgery, Nelson Pediatrics, WHO Guidelines

Format: Clear sections. Use simple language but include proper medical terminology. Explain every medical term when first used.

IMPORTANT: Always mention this is for educational purposes only at the end.\`;`;

// Find end of SYSTEM_PROMPT and add STUDY_PROMPT after it
const systemPromptEnd = "20. NEVER add words from other languages unless user used them first`;";
if (content.includes(systemPromptEnd)) {
  content = content.replace(systemPromptEnd, systemPromptEnd + studyPrompt);
  console.log('Step 1 DONE: Added STUDY_PROMPT');
} else {
  console.log('Step 1 SKIP: Could not find SYSTEM_PROMPT end marker');
}

// STEP 2: Update Intent Classifier to include STUDY
const oldIntentList = 'GREETING - hello, hi, how are you, greetings, thanks\nGENERAL - anything else';
const newIntentList = 'STUDY - medical education (explain, pathophysiology, mechanism, treatment protocol, diagnosis of, what is, how does, anatomy of, pharmacology)\nGREETING - hello, hi, how are you, greetings, thanks\nGENERAL - anything else';
if (content.includes(oldIntentList)) {
  content = content.replace(oldIntentList, newIntentList);
  console.log('Step 2 DONE: Updated Intent Classifier with STUDY');
} else {
  console.log('Step 2 SKIP: Could not find intent list');
}

// STEP 3: Add STUDY route in selectModelByIntent
const oldMentalRoute = "  if (intent === 'MENTAL') {";
const newStudyRoute = `  // 📚 SLOW PATH — Medical Study (deep knowledge needed)
  if (intent === 'STUDY') {
    console.log('📚 SLOW PATH → GPT-OSS 120B — Medical Study');
    return { model: 'openai/gpt-oss-120b', path: 'SLOW', reason: 'study' };
  }

  if (intent === 'MENTAL') {`;
if (content.includes(oldMentalRoute)) {
  content = content.replace(oldMentalRoute, newStudyRoute);
  console.log('Step 3 DONE: Added STUDY route');
} else {
  console.log('Step 3 SKIP: Could not find MENTAL route');
}

// STEP 4: Use STUDY_PROMPT when intent is STUDY
const oldPromptBuild = '// Step 6: Build enhanced prompt';
const newPromptBuild = `// Step 6: Select base prompt based on intent
    const basePrompt = intentResult.intent === 'STUDY' ? STUDY_PROMPT : SYSTEM_PROMPT;

    // Step 6: Build enhanced prompt`;
if (content.includes(oldPromptBuild)) {
  content = content.replace(oldPromptBuild, newPromptBuild);
  console.log('Step 4a DONE: Added base prompt selection');
} else {
  console.log('Step 4a SKIP: Could not find Step 6');
}

// Replace SYSTEM_PROMPT with basePrompt in enhanced prompt
const oldEnhanced = 'SYSTEM_PROMPT +';
const newEnhanced = 'basePrompt +';
if (content.includes(oldEnhanced)) {
  content = content.replace(oldEnhanced, newEnhanced);
  console.log('Step 4b DONE: Using basePrompt instead of SYSTEM_PROMPT');
} else {
  console.log('Step 4b SKIP: Could not find SYSTEM_PROMPT +');
}

// Also increase max_tokens for STUDY mode
const oldMaxTokens = 'max_tokens: 600,';
const newMaxTokens = 'max_tokens: intentResult.intent === "STUDY" ? 1500 : 600,';
if (content.includes(oldMaxTokens)) {
  content = content.replace(oldMaxTokens, newMaxTokens);
  console.log('Step 5 DONE: Increased max_tokens for STUDY mode');
} else {
  console.log('Step 5 SKIP: Could not find max_tokens');
}

fs.writeFileSync('backend/server.js', content);
console.log('\n✅ All steps complete! Study Mode added to MediBot!');