const fs = require('fs');
let lines = fs.readFileSync('src/components/ChatWindow.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('width=1024')) {
    lines[i] = '      // Desktop mode disabled for mobile';
    console.log('Fixed line ' + (i+1));
  }
}

fs.writeFileSync('src/components/ChatWindow.js', lines.join('\n'));
console.log('Done!');