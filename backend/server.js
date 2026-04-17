const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const { buildRAGContext } = require('./rag');
const { updatePatientProfile, buildLongTermContext } = require('./longTermMemory');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rate Limiting Store
const rateLimitStore = {};

// ✅ API Gateway Middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, startTime: now };
  } else {
    const timeElapsed = now - rateLimitStore[ip].startTime;
    if (timeElapsed > windowMs) {
      rateLimitStore[ip] = { count: 1, startTime: now };
    } else {
      rateLimitStore[ip].count++;
      if (rateLimitStore[ip].count > maxRequests) {
        console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
        return res.status(429).json({
          error: 'Too many requests. Please wait a minute before trying again.',
          retryAfter: Math.ceil((windowMs - timeElapsed) / 1000)
        });
      }
    }
  }

  if (req.body?.messages) {
    const lastMsg = req.body.messages.slice(-1)[0]?.content || '';
    const hasPII = /\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(lastMsg);
    if (hasPII) console.log('⚠️ PII detected in message — logging suppressed');
  }

  if (req.method === 'POST' && req.path === '/chat') {
    if (!req.body?.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    if (req.body.messages.length > 50) {
      return res.status(400).json({ error: 'Conversation too long. Please start a new consultation.' });
    }
  }

  next();
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    models: ['GPT-OSS-120B', 'DeepSeek-R1', 'Qwen3-32B', 'LLaMA-3.3-70B', 'LLaMA-3.1-8B'],
    languages: 31,
    whoTopics: 32
  });
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ 28+ Language Detection
function detectLanguage(text) {
  const lowerMsg = text.toLowerCase().trim();
  const englishGreetings = ['hi', 'hii', 'hiii', 'hey', 'hello', 'howdy', 'yo', 'sup', 'greetings', 'good morning', 'good evening', 'good night', 'how are you', 'what is', 'i have', 'i feel', 'help me', 'please help'];
  if (englishGreetings.some(w => lowerMsg === w || lowerMsg.startsWith(w + ' ') || lowerMsg.startsWith(w + '!'))) {
    return 'english';
  }

  if (text.trim().length < 4) return 'english';

  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
  if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'chinese';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'japanese';
  if (/[\uAC00-\uD7AF]/.test(text)) return 'korean';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'odia';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
  if (/[\u0E00-\u0E7F]/.test(text)) return 'thai';
  if (/[\u0400-\u04FF]/.test(text)) return 'russian';
  if (/[\u0370-\u03FF]/.test(text)) return 'greek';
  if (/[\u0590-\u05FF]/.test(text)) return 'hebrew';

  const words = text.toLowerCase().split(/\s+/);
  const hinglishWords = ['mujhe', 'mera', 'mere', 'mai', 'main', 'hai', 'hain', 'kya', 'nahi', 'bahut', 'sar', 'pet', 'bukhaar', 'dard', 'khasi', 'thakan', 'dawa'];
  const banglishWords = ['amar', 'ami', 'apni', 'apnar', 'ache', 'nei', 'lagche', 'khub', 'betha', 'bethaache', 'jor', 'jwor', 'matha', 'kelane', 'koto', 'bara', 'bhalo', 'kharap'];
  const tamilishWords = ['enakku', 'naan', 'irukku', 'illa', 'enna', 'eppo', 'valikuthu', 'kaichal'];

  if (hinglishWords.some(w => words.includes(w))) return 'hinglish';
  if (banglishWords.some(w => text.toLowerCase().includes(w))) return 'banglish';
  if (tamilishWords.some(w => words.includes(w))) return 'tamilish';

  const urduWords = ['آپ', 'میں', 'درد', 'بخار', 'بیمار', 'مدد', 'ڈاکٹر'];
  const spanishWords = ['hola', 'tengo', 'dolor', 'fiebre', 'duele', 'estoy', 'enfermo', 'ayuda'];
  const frenchWords = ['bonjour', 'mal', 'fièvre', 'douleur', 'malade', 'aide', 'salut'];
  const germanWords = ['hallo', 'ich', 'habe', 'schmerzen', 'fieber', 'krank', 'hilfe'];
  const portugueseWords = ['olá', 'ola', 'tenho', 'dor', 'febre', 'estou', 'doente'];
  const italianWords = ['ciao', 'ho', 'dolore', 'febbre', 'male', 'malato', 'aiuto'];
  const dutchWords = ['hallo', 'ik', 'heb', 'pijn', 'koorts', 'ziek', 'hulp'];
  const turkishWords = ['merhaba', 'ağrı', 'ateş', 'hasta', 'yardım', 'hissediyorum'];
  const indonesianWords = ['halo', 'saya', 'sakit', 'demam', 'nyeri', 'tolong', 'dokter'];
  const vietnameseWords = ['xin', 'chào', 'tôi', 'đau', 'sốt', 'bệnh', 'giúp'];
  const swahiliWords = ['habari', 'nina', 'maumivu', 'homa', 'mgonjwa', 'msaada'];

  if (urduWords.some(w => text.includes(w))) return 'urdu';
  if (spanishWords.some(w => words.includes(w))) return 'spanish';
  if (frenchWords.some(w => words.includes(w))) return 'french';
  if (germanWords.some(w => words.includes(w))) return 'german';
  if (portugueseWords.some(w => words.includes(w))) return 'portuguese';
  if (italianWords.some(w => words.includes(w))) return 'italian';
  if (dutchWords.some(w => words.includes(w))) return 'dutch';
  if (turkishWords.some(w => words.includes(w))) return 'turkish';
  if (indonesianWords.some(w => words.includes(w))) return 'indonesian';
  if (vietnameseWords.some(w => words.includes(w))) return 'vietnamese';
  if (swahiliWords.some(w => words.includes(w))) return 'swahili';

  return 'english';
}

// ✅ Check if Indian language
function isIndianLanguage(language) {
  return ['hindi', 'bengali', 'tamil', 'telugu', 'gujarati', 'malayalam',
    'punjabi', 'odia', 'kannada', 'urdu', 'hinglish', 'banglish', 'tamilish'].includes(language);
}

// ✅ Fixed Safety Check
async function isSafeMessage(message) {
  const lowerMessage = message.toLowerCase();

  const safeKeywords = [
    'fever', 'pain', 'headache', 'cough', 'cold', 'flu',
    'diabetes', 'blood pressure', 'chest', 'stomach', 'heart',
    'vomit', 'diarrhea', 'rash', 'allergy', 'breathing',
    'stroke', 'emergency', 'pregnant', 'baby', 'child',
    'medicine', 'doctor', 'hospital', 'symptom', 'sick',
    'ill', 'hurt', 'injury', 'wound', 'burn', 'swelling',
    'infection', 'fatigue', 'tired', 'dizzy', 'nausea',
    'cancer', 'asthma', 'malaria', 'dengue', 'typhoid',
    'kidney', 'liver', 'thyroid', 'arthritis', 'depression',
    'anxiety', 'mental', 'hello', 'hi', 'help', 'please',
    'thank', 'good', 'morning', 'evening', 'i have', 'i feel',
    'mujhe', 'mera', 'bukhaar', 'dard', 'sar', 'pet', 'khasi',
    'amar', 'betha', 'jor', 'matha', 'kelane', 'lagche', 'bara',
    'बुखार', 'दर्द', 'सिरदर्द', 'खांसी', 'बीमार', 'मदद',
    'জ্বর', 'ব্যথা', 'অসুস্থ', 'সাহায্য',
    'ألم', 'حمى', 'مريض', 'مساعدة'
  ];

  if (safeKeywords.some(k => lowerMessage.includes(k))) return true;

  const unsafeKeywords = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard',
    'kill yourself', 'go die', 'hate you',
    'sex', 'porn', 'naked', 'nude', 'xxx'
  ];

  if (unsafeKeywords.some(k => lowerMessage.includes(k))) return false;

  try {
    const safetyResponse = await groq.chat.completions.create({
      model: 'openai/gpt-oss-safeguard-20b',
      messages: [
        {
          role: 'system',
          content: `Safety classifier for medical chatbot.
UNSAFE only if: explicit hate speech, severe harassment, sexual content, violence.
Medical questions, symptoms, greetings, Indian language slang = SAFE.
Reply: SAFE or UNSAFE`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 10,
    });
    const result = safetyResponse.choices[0].message.content.trim().toUpperCase();
    return !result.includes('UNSAFE');
  } catch (error) {
    return true;
  }
}

// ✅ Step B — AI Intent Classifier
async function classifyIntent(message) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a medical intent classifier. Classify the user message into ONE intent:
EMERGENCY - life threatening (chest pain, stroke, not breathing, suicide, overdose, collapse)
COMPLEX - chronic conditions (diabetes, cancer, hypertension, surgery, kidney, liver, psychiatric)
SYMPTOM - general symptoms (fever, headache, cough, cold, nausea, rash, pain, tired)
MENTAL - mental health (depression, anxiety, stress, sadness, crying, hopeless)
STUDY - ONLY when user explicitly asks to learn/study medical theory (explain pathophysiology, explain mechanism, explain anatomy, teach me about, study mode). Keywords: explain, pathophysiology, mechanism, anatomy, teach
MEDICATION - asking about taking medicine, drug interactions, dosage, can I take (can I take, should I take, is it safe to take, medicine for, drug for, tablet for)
GREETING - hello, hi, how are you, greetings, thanks
GENERAL - anything else

Complexity level:
HIGH - needs expert model (complex, emergency, mental)
LOW - needs fast model (greeting, general, simple symptom)

Respond in this exact JSON only, no extra text:
{"intent": "SYMPTOM", "complexity": "LOW", "confidence": 0.95}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 60,
      temperature: 0.1,
    });

    const result = response.choices[0].message.content.trim();
    const cleaned = result.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log('Intent classifier failed, using fallback');
    return { intent: 'GENERAL', complexity: 'LOW', confidence: 0.5 };
  }
}

// ✅ Smart Model Selection based on Intent
function selectModelByIntent(intent, complexity, language) {
  const isIndian = isIndianLanguage(language);
  const isMultilingual = language !== 'english';

  if (intent === 'EMERGENCY') {
    console.log('🚨 FAST PATH → GPT-OSS 120B — Emergency');
    return { model: 'openai/gpt-oss-120b', path: 'FAST' };
  }

  if (intent === 'COMPLEX' || complexity === 'HIGH') {
    console.log('🧠 SLOW PATH → DeepSeek R1 — Complex medical');
    return { model: 'openai/gpt-oss-120b', path: 'SLOW' };
  }

  // 💊 FAST PATH — Medication questions
  if (intent === 'MEDICATION') {
    console.log('💊 FAST PATH → LLaMA 3.3 70b — Medication');
    return { model: 'llama-3.3-70b-versatile', path: 'FAST', reason: 'medication' };
  }

  // 📚 SLOW PATH — Medical Study (deep knowledge needed)
  if (intent === 'STUDY') {
    console.log('📚 SLOW PATH → GPT-OSS 120B — Medical Study');
    return { model: 'openai/gpt-oss-120b', path: 'SLOW', reason: 'study' };
  }

  if (intent === 'MENTAL') {
    console.log('💙 SLOW PATH → LLaMA 3.3 70b — Mental health');
    return { model: 'openai/gpt-oss-120b', path: 'SLOW' };
  }

  if (isIndian || isMultilingual) {
    console.log(`🌍 FAST PATH → Qwen3 32B — ${language}`);
    return { model: 'qwen/qwen3-32b', path: 'FAST' };
  }

  if (intent === 'SYMPTOM') {
    console.log('🏥 FAST PATH → LLaMA 3.3 70b — Symptoms');
    return { model: 'llama-3.3-70b-versatile', path: 'FAST' };
  }

  console.log('💬 FAST PATH → LLaMA 3.1 8b — General');
  return { model: 'llama-3.1-8b-instant', path: 'FAST' };
}

// ✅ Language Response Prompt
function getLanguagePrompt(language) {
  const prompts = {
    hindi: '\n\nIMPORTANT: Respond ONLY in Hindi (Devanagari script).',
    bengali: '\n\nIMPORTANT: Respond ONLY in Bengali script.',
    hinglish: '\n\nIMPORTANT: User writes in Hinglish (Hindi+English mix). Understand and respond in same Hinglish style. Common terms: bukhaar=fever, sar dard=headache, pet dard=stomach ache, khasi=cough, thakan=fatigue.',
    banglish: '\n\nIMPORTANT: User writes in Banglish (Bengali+English mix). Common terms: matha betha=headache, jor/jwor=fever, pet betha=stomach ache, bara/balo na=unwell, kelane=how long. Respond in same Banglish style.',
    tamilish: '\n\nIMPORTANT: User writes in Tanglish (Tamil+English mix). Common terms: kaichal=fever, thalai vali=headache, vayiru vali=stomach ache.',
    arabic: '\n\nIMPORTANT: Respond ONLY in Arabic.',
    urdu: '\n\nIMPORTANT: Respond ONLY in Urdu script.',
    chinese: '\n\nIMPORTANT: Respond ONLY in Chinese.',
    japanese: '\n\nIMPORTANT: Respond ONLY in Japanese.',
    korean: '\n\nIMPORTANT: Respond ONLY in Korean.',
    gujarati: '\n\nIMPORTANT: Respond ONLY in Gujarati.',
    telugu: '\n\nIMPORTANT: Respond ONLY in Telugu.',
    tamil: '\n\nIMPORTANT: Respond ONLY in Tamil.',
    malayalam: '\n\nIMPORTANT: Respond ONLY in Malayalam.',
    punjabi: '\n\nIMPORTANT: Respond ONLY in Punjabi.',
    odia: '\n\nIMPORTANT: Respond ONLY in Odia.',
    kannada: '\n\nIMPORTANT: Respond ONLY in Kannada.',
    thai: '\n\nIMPORTANT: Respond ONLY in Thai.',
    russian: '\n\nIMPORTANT: Respond ONLY in Russian.',
    greek: '\n\nIMPORTANT: Respond ONLY in Greek.',
    hebrew: '\n\nIMPORTANT: Respond ONLY in Hebrew.',
    spanish: '\n\nIMPORTANT: Respond ONLY in Spanish.',
    french: '\n\nIMPORTANT: Respond ONLY in French.',
    german: '\n\nIMPORTANT: Respond ONLY in German.',
    portuguese: '\n\nIMPORTANT: Respond ONLY in Portuguese.',
    italian: '\n\nIMPORTANT: Respond ONLY in Italian.',
    dutch: '\n\nIMPORTANT: Respond ONLY in Dutch.',
    turkish: '\n\nIMPORTANT: Respond ONLY in Turkish.',
    indonesian: '\n\nIMPORTANT: Respond ONLY in Indonesian.',
    vietnamese: '\n\nIMPORTANT: Respond ONLY in Vietnamese.',
    swahili: '\n\nIMPORTANT: Respond ONLY in Swahili.',
    english: '\n\nIMPORTANT: Respond ONLY in English. Do NOT use Hindi, Bengali, or any other language.'
  };
  return prompts[language] || '\n\nIMPORTANT: Respond in the same language the user is writing in.';
}

// ✅ Doctor-Level System Prompt
const SYSTEM_PROMPT = `You are Dr. MediBot, an AI medical assistant with 30 years of experience across internal medicine, emergency medicine, and general practice.

Your approach:
1. Warmly greet the patient and make them feel comfortable
2. Gather symptoms systematically - ask ONE question at a time
3. Ask about: duration, severity (1-10), location, what makes it better/worse
4. Ask about age, gender, existing conditions, current medications
5. ALWAYS ask about allergies before mentioning any medication
6. Think through differential diagnoses (never state definitive diagnosis)
7. Give evidence-based advice backed by WHO guidelines
8. Provide practical home remedies and first-aid when appropriate
9. For emergencies: IMMEDIATELY urge calling 112 or going to ER
10. Always end with recommending professional medical consultation
11. NEVER recommend specific drug doses
12. NEVER diagnose definitively - always say "possible" or "could be"
13. Always remind the user you are an AI, not a real doctor
14. Be warm, empathetic, calm, and easy to understand
15. Never use medical jargon without explaining it simply
16. For mental health concerns, be extra gentle and supportive
17. If someone seems in crisis, provide emergency resources immediately
18. CRITICAL: Always respond in the EXACT same language the user wrote in
19. If user writes English → ONLY English. If Hindi → ONLY Hindi. If Bengali → ONLY Bengali
20. NEVER add words from other languages unless user used them first`;

const STUDY_PROMPT = `You are Dr. MediBot Professor Mode — a world-class medical professor with expertise across all medical specialties.

When a medical student asks a question:
1. Start with a clear, simple definition
2. Explain the pathophysiology step by step
3. List the etiology (causes)
4. Describe clinical features and symptoms
5. Explain diagnostic approach and investigations
6. Describe treatment protocols (pharmacological + non-pharmacological)
7. Mention complications if untreated
8. Add recent research findings when relevant
9. Use mnemonics to help remember
10. End with a clinical pearl or exam tip

Sources: Harrison Internal Medicine, Robbins Pathology, Guyton Physiology, Davidson Medicine, Bailey and Love Surgery, Nelson Pediatrics, WHO Guidelines

Format: Use plain text only. NO markdown, NO tables, NO bold, NO headers, NO pipes. Use numbered lists and line breaks for structure. Write in clear paragraphs with numbered points. Keep it readable like a textbook chapter, not a formatted document.

IMPORTANT: Always mention this is for educational purposes only at the end.`;





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
    const medicalTerms = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    let context = '';
    for (const term of medicalTerms.slice(0, 3)) {
      const found = await db.collection('knowledge').findOne({
        topic: { $regex: term, $options: 'i' }
      });
      if (found) {
        context += '\nExpanded Knowledge on ' + found.topic + ': ' + found.knowledge.slice(0, 300);
      }
    }
    
    await client.close();
    
    if (context) {
      return '\n\nEXPANDED MEDICAL KNOWLEDGE (from database):' + context;
    }
    return '';
  } catch (error) {
    return '';
  }
}

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
      return '\n\nFEEDBACK LEARNING: A similar question was asked before and the response was rated poorly. The bad response was: "' + fb.badReply + '". Please provide a DIFFERENT and BETTER response this time. Be more specific, empathetic, and helpful.';
    }

    // Check MongoDB for similar past feedback
    const { MongoClient } = require('mongodb');
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('medibot');
      const similarFeedback = await db.collection('feedback').findOne({
        question: { $regex: message.slice(0, 50), $options: 'i' }
      });
      await client.close();

      if (similarFeedback) {
        return '\n\nFEEDBACK LEARNING: A similar question received negative feedback before. Previous bad response: "' + similarFeedback.badReply.slice(0, 150) + '". Provide a BETTER, more detailed response.';
      }
    } catch (e) {}

    return '';
  } catch (error) {
    return '';
  }
}

app.post('/chat', async (req, res) => {
  try {
    const { messages, patient } = req.body;

    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';

    // Step 1: Safety check
    const safe = await isSafeMessage(lastUserMessage);
    if (!safe) {
      return res.json({
        reply: "I'm Dr. MediBot, here to help with medical questions only. Please feel free to ask me about any symptoms or health concerns. I'm here to help! 🏥",
        modelUsed: 'safety-filter',
        whoGuidelinesUsed: false
      });
    }

    // Step 2: Detect language
    const preferredLanguage = patient?.language;
    const language = (preferredLanguage && preferredLanguage !== 'auto')
      ? preferredLanguage
      : detectLanguage(lastUserMessage);
    console.log(`🌍 Language: ${language}`);

    // ✅ Step 3: AI Intent Classification + Smart Model Selection
    const intentResult = await classifyIntent(lastUserMessage);
    console.log(`🎯 Intent: ${intentResult.intent} | Complexity: ${intentResult.complexity} | Confidence: ${intentResult.confidence}`);
    const { model: selectedModel, path: routingPath } = selectModelByIntent(intentResult.intent, intentResult.complexity, language);

    // Step 4: WHO guidelines
    const ragContext = buildRAGContext(lastUserMessage);

    // Step 5: Patient context + Long-term Memory
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const memoryKey = patient?.name ? 'patient_' + patient.name.toLowerCase().replace(/\s/g, '_') : 'ip_' + ip;
    await updatePatientProfile(memoryKey, {
      conditions: [],
      symptoms: [],
      allergies: [],
      language,
      intent: intentResult.intent
    });
    const longTermContext = await buildLongTermContext(memoryKey);
    // Step 5: Patient context
    const patientContext = patient?.name
      ? `\n\nPatient: Name: ${patient.name}, Age: ${patient.age || 'unknown'}, Gender: ${patient.gender || 'unknown'}`
      : '';

    // Step 6: Select base prompt based on intent
    const basePrompt = intentResult.intent === 'STUDY' ? STUDY_PROMPT : SYSTEM_PROMPT;

    // Step 6: Build enhanced prompt
    // Get feedback learning context
    const feedbackContext = await getFeedbackContext(lastUserMessage);
    const expandedKnowledge = await searchExpandedKnowledge(lastUserMessage);

    const enhancedSystemPrompt =
      basePrompt +
      patientContext +
      longTermContext +
      longTermContext +
  getLanguagePrompt(language) +
      ragContext +
      feedbackContext +
      expandedKnowledge;

    // Step 7: Get AI response
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ],
      max_tokens: intentResult.intent === "STUDY" ? 4000 : 800,
      temperature: 0.7,
    });

   let reply = response.choices[0].message.content;
reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
// Also handle unclosed think tags
if (reply.includes('<think>')) {
  reply = reply.replace(/<think>[\s\S]*/g, '').trim();
}

    res.json({
      reply,
      modelUsed: selectedModel,
      language,
      intent: intentResult.intent,
      routingPath,
      whoGuidelinesUsed: ragContext.length > 0
    });

  } catch (error) {
    console.error('Error:', error.message);
    try {
      const fallbackResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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
  console.log('✅ MediBot — API Gateway + Intent Classifier + 6 Models + 31 Languages + RAG');
});