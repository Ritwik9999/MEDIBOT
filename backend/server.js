const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const { buildRAGContext } = require('./rag');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Updated Multi-Model Routing with GPT-OSS 120B
function selectModel(messages) {
  const lastMessage = messages
    .filter(m => m.role === 'user')
    .slice(-1)[0]?.content?.toLowerCase() || '';

  // Emergency keywords → GPT-OSS 120B (most powerful)
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'breathing',
    'emergency', 'unconscious', 'bleeding', 'suicide',
    'overdose', 'seizure', 'severe', 'critical', '112'
  ];

  // Complex symptom keywords → LLaMA 3.3 70b
  const complexKeywords = [
    'diabetes', 'blood pressure', 'hypertension', 'cancer',
    'infection', 'chronic', 'diagnosis', 'treatment', 'surgery',
    'medication', 'prescription', 'allergy', 'reaction'
  ];

  // General symptom keywords → Qwen3 32B
  const symptomKeywords = [
    'fever', 'headache', 'cough', 'cold', 'pain',
    'diarrhea', 'vomit', 'nausea', 'rash', 'tired',
    'fatigue', 'injury', 'wound', 'swelling', 'ache'
  ];

  const isEmergency = emergencyKeywords.some(k => lastMessage.includes(k));
  const isComplex = complexKeywords.some(k => lastMessage.includes(k));
  const isSymptom = symptomKeywords.some(k => lastMessage.includes(k));

  if (isEmergency) {
    console.log('🚨 Using GPT-OSS 120B — Emergency case');
    return 'openai/gpt-oss-120b';
  } else if (isComplex) {
    console.log('🏥 Using LLaMA 3.3 70b — Complex case');
    return 'llama-3.3-70b-versatile';
  } else if (isSymptom) {
    console.log('🧠 Using Qwen3 32B — Symptom case');
    return 'qwen-qwq-32b';
  } else {
    console.log('💬 Using LLaMA 3.1 8b — General case');
    return 'llama-3.1-8b-instant';
  }
}

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
9. When WHO guidelines are provided, use them to give accurate evidence-based advice
10. NEVER recommend specific medication doses - only mention medication names generally
11. ALWAYS ask about allergies before mentioning any medication
12. NEVER classify symptoms as critical based on a single symptom alone
13. ALWAYS remind the user you are an AI and not a real doctor in every response
14. NEVER provide specific dosage instructions for any medicine
15. If unsure about any symptom, always recommend seeing a real doctor immediately`;

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Get last user message for RAG retrieval
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';

    // ✅ Select best model based on message
    const selectedModel = selectModel(messages);

    // ✅ Retrieve relevant WHO guidelines
    const ragContext = buildRAGContext(lastUserMessage);

    // Inject RAG context into system prompt
    const enhancedSystemPrompt = SYSTEM_PROMPT + ragContext;

    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    res.json({
      reply,
      modelUsed: selectedModel,
      whoGuidelinesUsed: ragContext.length > 0
    });

  } catch (error) {
    console.error('Error:', error.message);
    // ✅ Fallback to LLaMA if any model fails
    try {
      const fallbackResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...req.body.messages
        ],
        max_tokens: 500,
      });
      res.json({ reply: fallbackResponse.choices[0].message.content });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
});

// Keep alive ping
setInterval(() => {
  fetch('https://medibot-backend-neuz.onrender.com')
    .then(() => console.log('✅ Keep alive ping sent'))
    .catch(() => console.log('⚠️ Ping failed'));
}, 840000);

app.listen(5000, () => {
  console.log('✅ MediBot backend running with GPT-OSS 120B + Multi-Model AI + RAG');
});