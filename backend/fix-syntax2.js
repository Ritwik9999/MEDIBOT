const fs = require('fs');
let lines = fs.readFileSync('backend/server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('$regex') && lines[i].includes('message.slice')) {
    lines[i] = "        question: { $regex: message.slice(0, 50), $options: 'i' }";
    console.log('Fixed line ' + (i+1));
  }
}

fs.writeFileSync('backend/server.js', lines.join('\n'));
console.log('Done!');