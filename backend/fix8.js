const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
content = content.replace(/deepseek-r1-distill-qwen-32b/g, 'openai/gpt-oss-120b');
fs.writeFileSync('server.js', content);
console.log('Done!');