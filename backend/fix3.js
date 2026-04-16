const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

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
fs.writeFileSync('server.js', content);
console.log('Done!');