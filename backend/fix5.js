const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
content = content.replace(/llama-3\.3-70b-versatile/g, 'deepseek-r1-distill-qwen-32b');
fs.writeFileSync('server.js', content);
console.log('Done!');