const fs = require('fs');
const path = require('path');

// Load WHO guidelines
const guidelines = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'who-guidelines.json'), 'utf-8')
);

// Simple keyword-based retrieval (no paid API needed)
function retrieveGuidelines(userMessage) {
  const query = userMessage.toLowerCase();

  const scored = guidelines.map(doc => {
    const content = (doc.topic + ' ' + doc.content).toLowerCase();
    const words = query.split(/\s+/);
    
    let score = 0;
    words.forEach(word => {
      if (word.length > 3 && content.includes(word)) {
        score += 1;
      }
    });

    if (query.includes(doc.topic.toLowerCase())) {
      score += 5;
    }

    return { ...doc, score };
  });

  const relevant = scored
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return relevant;
}

function buildRAGContext(userMessage) {
  const relevant = retrieveGuidelines(userMessage);
  
  if (relevant.length === 0) return '';

  const context = relevant
    .map(doc => `[WHO Guidelines - ${doc.topic}]: ${doc.content}`)
    .join('\n\n');

  return `\n\nRELEVANT WHO MEDICAL GUIDELINES:\n${context}\n\nUse the above WHO guidelines to inform your response, but explain it in simple friendly language.`;
}

module.exports = { buildRAGContext };