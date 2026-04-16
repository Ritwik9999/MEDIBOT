const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix: Only SLOW PATH should use DeepSeek
// Fast path and fallback should use llama-3.3-70b-versatile
content = content.replace(
  "return { model: 'deepseek-r1-distill-qwen-32b', path: 'FAST' };",
  "return { model: 'llama-3.3-70b-versatile', path: 'FAST' };"
);
content = content.replace(
  "model: 'deepseek-r1-distill-qwen-32b',\n",
  "model: 'llama-3.3-70b-versatile',\n"
);

fs.writeFileSync('server.js', content);
console.log('Done!');