const fs = require('fs');
let lines = fs.readFileSync('backend/server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('intentResult.intent === "STUDY" ? 1500 : 600')) {
    lines[i] = lines[i].replace('1500 : 600', '4000 : 800');
    console.log('Fixed line ' + (i+1) + ': max_tokens updated to 4000 for STUDY, 800 for normal');
  }
}

fs.writeFileSync('backend/server.js', lines.join('\n'));
console.log('Done!');