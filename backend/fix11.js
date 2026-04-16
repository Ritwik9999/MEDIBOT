const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix system prompt language mixing
content = content.replace(
  '18. Understand code-mixed Indian languages like Hinglish and Banglish\n19. Common Banglish: bara/balo na=unwell, kelane=how long, matha betha=headache, jor=fever\n20. Common Hinglish: bukhaar=fever, sar dard=headache, pet dard=stomach ache, khasi=cough`',
  '18. CRITICAL: Always respond in the EXACT same language the user wrote in\n19. If user writes in English - respond ONLY in English, never add Bengali/Hindi words\n20. Only use regional language terms if the user themselves wrote in that language\n21. NEVER mix languages unless the user mixed them first`'
);

fs.writeFileSync('server.js', content);
console.log('Done!');