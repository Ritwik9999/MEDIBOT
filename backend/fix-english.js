const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Fix: English language prompt should enforce English response
const oldEnglish = "english: ''";
const newEnglish = "english: '\\n\\nIMPORTANT: Respond ONLY in English. Do NOT use Hindi, Bengali, or any other language.'";

content = content.replace(oldEnglish, newEnglish);

fs.writeFileSync('backend/server.js', content);
console.log('Done! English language enforcement added');