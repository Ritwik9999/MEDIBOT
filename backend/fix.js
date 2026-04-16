const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
const oldLine = "const { buildRAGContext } = require('./rag');";
const newLine = "const { buildRAGContext } = require('./rag');\nconst { updatePatientProfile, buildLongTermContext } = require('./longTermMemory');";
content = content.replace(oldLine, newLine);
fs.writeFileSync('server.js', content);
console.log('Done!');