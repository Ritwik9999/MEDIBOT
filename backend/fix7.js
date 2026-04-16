const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines[416] = lines[416].replace('deepseek-r1-distill-qwen-32b', 'llama-3.3-70b-versatile');
fs.writeFileSync('server.js', lines.join('\n'));
console.log('Done! Line 417:', lines[416]);