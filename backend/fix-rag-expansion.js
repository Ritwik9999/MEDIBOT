const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Add RAG Knowledge Expansion endpoint
const ragExpansion = `

// ✅ RAG Knowledge Expansion System
app.post('/learn', async (req, res) => {
  try {
    const { topic, knowledge } = req.body;
    if (!topic || !knowledge) return res.status(400).json({ error: 'Missing topic or knowledge' });

    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('medibot');
    await db.collection('knowledge').updateOne(
      { topic: topic.toLowerCase() },
      { $set: { 
        topic: topic.toLowerCase(), 
        knowledge, 
        updatedAt: new Date().toISOString() 
      }},
      { upsert: true }
    );
    await client.close();
    console.log('📚 New knowledge stored: ' + topic);
    res.json({ status: 'ok', topic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to store knowledge' });
  }
});

// ✅ Search expanded knowledge from MongoDB
async function searchExpandedKnowledge(message) {
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('medibot');

    // Extract key medical terms from message
    const medicalTerms = message.toLowerCase().split(/\\s+/).filter(w => w.length > 3);
    
    let context = '';
    for (const term of medicalTerms.slice(0, 3)) {
      const found = await db.collection('knowledge').findOne({
        topic: { $regex: term, $options: 'i' }
      });
      if (found) {
        context += '\\nExpanded Knowledge on ' + found.topic + ': ' + found.knowledge.slice(0, 300);
      }
    }
    
    await client.close();
    
    if (context) {
      return '\\n\\nEXPANDED MEDICAL KNOWLEDGE (from database):' + context;
    }
    return '';
  } catch (error) {
    return '';
  }
}
`;

// Add before feedback endpoint or chat route
const feedbackSystem = '// ✅ Feedback Learning System';
if (content.includes(feedbackSystem)) {
  content = content.replace(feedbackSystem, ragExpansion + '\n' + feedbackSystem);
  console.log('Step 1 DONE: Added RAG expansion endpoint');
} else {
  console.log('Step 1 SKIP: Could not find feedback system marker');
}

// Add expanded knowledge to prompt
const oldFeedback = 'const feedbackContext = await getFeedbackContext(lastUserMessage);';
const newFeedback = `const feedbackContext = await getFeedbackContext(lastUserMessage);
    const expandedKnowledge = await searchExpandedKnowledge(lastUserMessage);`;
if (content.includes(oldFeedback)) {
  content = content.replace(oldFeedback, newFeedback);
  console.log('Step 2 DONE: Added expanded knowledge lookup');
} else {
  console.log('Step 2 SKIP: Could not find feedback context line');
}

// Add expandedKnowledge to prompt chain
const oldFeedbackChain = 'feedbackContext;';
const newFeedbackChain = 'feedbackContext +\n      expandedKnowledge;';
if (content.includes(oldFeedbackChain)) {
  content = content.replace(oldFeedbackChain, newFeedbackChain);
  console.log('Step 3 DONE: Added expandedKnowledge to prompt chain');
} else {
  console.log('Step 3 SKIP: Could not find feedbackContext chain');
}

fs.writeFileSync('backend/server.js', content);
console.log('\n✅ RAG Knowledge Expansion System added!');