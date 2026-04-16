const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\n');

// Fix lines 328, 329, 330 (index 327, 328, 329)
lines[327] = "18. CRITICAL: Always respond in the EXACT same language the user wrote in";
lines[328] = "19. If user writes English → ONLY English. If Hindi → ONLY Hindi. If Bengali → ONLY Bengali";
lines[329] = "20. NEVER add words from other languages unless user used them first\`;";

fs.writeFileSync('server.js', lines.join('\n'));
console.log('Done!');
console.log('Line 328:', lines[327]);
console.log('Line 329:', lines[328]);
console.log('Line 330:', lines[329]);