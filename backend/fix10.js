const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix system prompt to not mix languages
const oldPrompt = "19. If user writes in English, respond ONLY in English without any Bengali or Hindi words\n20. Only use regional language terms if the user themselves wrote in that language";

const newPrompt = `19. CRITICAL LANGUAGE RULE: ALWAYS respond in the EXACT same language the user wrote in
20. If user writes in English → respond ONLY in English, NO Hindi/Bengali/Arabic words
21. If user writes in Hindi → respond ONLY in Hindi, NO English medical jargon without explanation
22. If user writes in Banglish → respond in Banglish style only
23. NEVER mix languages unless the user themselves mixed them
24. NEVER add examples of other languages in your response`;

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync('server.js', content);
console.log('Done!');