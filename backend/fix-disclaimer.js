const fs = require('fs');
let lines = fs.readFileSync('src/components/ChatWindow.js', 'utf8').split('\n');

const oldLine = lines[269]; // line 270 (0-indexed = 269)
console.log('Old line 270:', oldLine.trim());

lines[269] = `                {msg.role === 'assistant' && msg.content.includes('educational purposes') ? (
                  <>
                    {msg.content.split('This response is provided for educational purposes')[0]}
                    <span style={{ color: '#dc3545', fontWeight: 'bold', fontStyle: 'italic', display: 'block', marginTop: 8 }}>
                      ⚠️ This response is provided for educational purposes only and does not substitute professional medical advice.
                    </span>
                  </>
                ) : msg.content}`;

console.log('New line 270: replaced with styled disclaimer');
fs.writeFileSync('src/components/ChatWindow.js', lines.join('\n'));
console.log('Done!');