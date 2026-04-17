const fs = require('fs');
let lines = fs.readFileSync('backend/server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("reply = reply.replace(/\\*\\*(.*?)\\*\\*/g, '$1');")) {
    // Replace with stronger markdown removal
    lines[i] = "    reply = reply.replace(/\\*{1,3}(.*?)\\*{1,3}/g, '$1');";
    console.log('Fixed bold removal at line ' + (i+1));
    break;
  }
}

fs.writeFileSync('backend/server.js', lines.join('\n'));
console.log('Done!');