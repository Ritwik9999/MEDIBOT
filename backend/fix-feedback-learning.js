const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Add feedback storage endpoint
const feedbackEndpoint = `

// ✅ Feedback Learning System
const feedbackStore = new Map();

app.post('/feedback', async (req, res) => {
  try {
    const { message, reply, feedback, intent } = req.body;
    const key = message.toLowerCase().trim().slice(0, 100);

    if (feedback === 'down') {
      feedbackStore.set(key, {
        badReply: reply.slice(0, 200),
        intent,
        timestamp: new Date().toISOString()
      });
      console.log('📝 Negative feedback stored for learning');

      // Also store in MongoDB for persistence
      const { MongoClient } = require('mongodb');
      try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('medibot');
        await db.collection('feedback').insertOne({
          question: message,
          badReply: reply.slice(0, 300),
          feedback: 'negative',
          intent,
          timestamp: new Date().toISOString()
        });
        await client.close();
        console.log('💾 Feedback saved to MongoDB');
      } catch (e) {
        console.log('MongoDB feedback save failed');
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    res.json({ status: 'ok' });
  }
});

// ✅ Build feedback context for better responses
async function getFeedbackContext(message) {
  try {
    const key = message.toLowerCase().trim().slice(0, 100);

    // Check in-memory first
    if (feedbackStore.has(key)) {
      const fb = feedbackStore.get(key);
      return '\\n\\nFEEDBACK LEARNING: A similar question was asked before and the response was rated poorly. The bad response was: "' + fb.badReply + '". Please provide a DIFFERENT and BETTER response this time. Be more specific, empathetic, and helpful.';
    }

    // Check MongoDB for similar past feedback
    const { MongoClient } = require('mongodb');
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('medibot');
      const similarFeedback = await db.collection('feedback').findOne({
        question: { $regex: message.slice(0, 50).replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), $options: 'i' }
      });
      await client.close();

      if (similarFeedback) {
        return '\\n\\nFEEDBACK LEARNING: A similar question received negative feedback before. Previous bad response: "' + similarFeedback.badReply.slice(0, 150) + '". Provide a BETTER, more detailed response.';
      }
    } catch (e) {}

    return '';
  } catch (error) {
    return '';
  }
}
`;

// Add before the /chat route
const chatRoute = "app.post('/chat', async (req, res) => {";
if (content.includes(chatRoute)) {
  content = content.replace(chatRoute, feedbackEndpoint + '\n' + chatRoute);
  console.log('Step 1 DONE: Added feedback endpoint + learning system');
} else {
  console.log('Step 1 SKIP: Could not find chat route');
}

// Add feedback context to enhanced prompt
const oldPromptBuild = 'const enhancedSystemPrompt =';
const newPromptBuild = `// Get feedback learning context
    const feedbackContext = await getFeedbackContext(lastUserMessage);

    const enhancedSystemPrompt =`;
if (content.includes(oldPromptBuild)) {
  content = content.replace(oldPromptBuild, newPromptBuild);
  console.log('Step 2 DONE: Added feedback context to prompt');
} else {
  console.log('Step 2 SKIP: Could not find prompt build');
}

// Add feedbackContext to the prompt chain
const oldRagContext = 'ragContext;';
const newRagContext = 'ragContext +\n      feedbackContext;';
if (content.includes(oldRagContext)) {
  content = content.replace(oldRagContext, newRagContext);
  console.log('Step 3 DONE: Added feedbackContext to prompt chain');
} else {
  console.log('Step 3 SKIP: Could not find ragContext');
}

fs.writeFileSync('backend/server.js', content);
console.log('\n✅ Feedback Learning System added!');