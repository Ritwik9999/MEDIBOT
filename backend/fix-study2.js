const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Find the actual intent list text
const oldIntent = "GREETING - hello, hi, how are you, greetings, thanks";
const newIntent = "STUDY - medical education (explain, pathophysiology, mechanism, treatment protocol, diagnosis of, what is, how does, anatomy, pharmacology)\nGREETING - hello, hi, how are you, greetings, thanks";

if (content.includes(oldIntent)) {
  content = content.replace(oldIntent, newIntent);
  console.log('DONE: Added STUDY intent to classifier');
} else {
  // Try alternate text
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('GREETING') && lines[i].includes('hello')) {
      lines.splice(i, 0, 'STUDY - medical education (explain, pathophysiology, mechanism, treatment protocol, diagnosis of, what is, how does, anatomy, pharmacology)');
      console.log('DONE: Inserted STUDY intent at line ' + i);
      break;
    }
  }
  content = lines.join('\n');
}

fs.writeFileSync('backend/server.js', content);
console.log('✅ Intent classifier updated!');