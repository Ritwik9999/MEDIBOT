const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Add await to buildLongTermContext
const oldStep5 = "// ✅ Step 5: Patient context + Memory System";
const newStep5 = `// ✅ Step 5: Patient context + Memory System + Long-term Memory`;

// Add longTermContext after memoryContext line
const oldMemory = "const memoryContext = buildMemoryContext(memory);";
const newMemory = `const memoryContext = buildMemoryContext(memory);

// ✅ Long-term Memory from MongoDB
const longTermData = {
  conditions: memory.conditions,
  symptoms: memory.symptoms,
  allergies: memory.allergies,
  language,
  intent: intentResult.intent
};
await updatePatientProfile(memoryKey, longTermData);
const longTermContext = await buildLongTermContext(memoryKey);`;

content = content.replace(oldMemory, newMemory);

// Add longTermContext to enhanced prompt
const oldPrompt = "getLanguagePrompt(language) +";
const newPrompt = `longTermContext +
  getLanguagePrompt(language) +`;

content = content.replace(oldPrompt, newPrompt);

fs.writeFileSync('server.js', content);
console.log('Done!');