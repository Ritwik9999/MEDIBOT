const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const { buildRAGContext } = require('./rag');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are MediBot, a helpful and caring healthcare assistant.
Your job is to:
1. Warmly greet the patient and ask about their symptoms
2. Ask follow-up questions one at a time (age, how long, severity 1-10)
3. Based on symptoms suggest possible conditions (never say definitive diagnosis)
4. Always recommend seeing a real doctor for proper treatment
5. Give simple first-aid or home remedy tips where appropriate
6. If symptoms are severe like chest pain, difficulty breathing, stroke signs - immediately urge them to call emergency services
7. Always be calm, empathetic and easy to understand
8. Never use complicated medical jargon without explaining it simply
9. When WHO guidelines are provided, use them to give accurate evidence-based advice`;

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Get last user message for RAG retrieval
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';

    // Retrieve relevant WHO guidelines
    const ragContext = buildRAGContext(lastUserMessage);

    // Inject RAG context into system prompt
    const enhancedSystemPrompt = SYSTEM_PROMPT + ragContext;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    // Send reply + whether RAG was used (for frontend badge)
    res.json({ 
      reply,
      whoGuidelinesUsed: ragContext.length > 0
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Keep alive ping
setInterval(() => {
  fetch('https://medibot-backend-neuz.onrender.com')
    .then(() => console.log('✅ Keep alive ping sent'))
    .catch(() => console.log('⚠️ Ping failed'));
}, 840000);

app.listen(5000, () => {
  console.log('✅ MediBot backend running with RAG on http://localhost:5000');
});