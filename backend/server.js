const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const { buildRAGContext } = require('./rag');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ 28 Language Detection
function detectLanguage(text) {
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
  const urduWords = ['آپ', 'میں', 'درد', 'بخار', 'بیمار', 'مدد', 'ڈاکٹر'];
  const spanishWords = ['hola', 'tengo', 'dolor', 'fiebre', 'me', 'duele', 'estoy', 'enfermo', 'ayuda', 'siento'];
  const frenchWords = ['bonjour', 'jai', 'mal', 'fièvre', 'douleur', 'malade', 'aide', 'salut', 'je'];
  const germanWords = ['hallo', 'ich', 'habe', 'schmerzen', 'fieber', 'krank', 'hilfe', 'guten', 'bitte'];
  const portugueseWords = ['olá', 'ola', 'tenho', 'dor', 'febre', 'estou', 'doente', 'ajuda', 'sinto'];
  const italianWords = ['ciao', 'ho', 'dolore', 'febbre', 'male', 'malato', 'aiuto', 'sento', 'sto'];
  const dutchWords = ['hallo', 'ik', 'heb', 'pijn', 'koorts', 'ziek', 'hulp', 'voel', 'mijn'];
  const turkishWords = ['merhaba', 'ağrı', 'ateş', 'hasta', 'yardım', 'var', 'hissediyorum'];
  const indonesianWords = ['halo', 'saya', 'sakit', 'demam', 'nyeri', 'tolong', 'merasa', 'dokter'];
  const vietnameseWords = ['xin', 'chào', 'tôi', 'đau', 'sốt', 'bệnh', 'giúp', 'cảm', 'thấy'];
  const swahiliWords = ['habari', 'nina', 'maumivu', 'homa', 'mgonjwa', 'msaada', 'daktari'];

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

// ✅ Safety Check
async function isSafeMessage(message) {
  try {
    const safetyResponse = await groq.chat.completions.create({
      model: 'openai/gpt-oss-safeguard-20b',
      messages: [
        {
          role: 'system',
          content: `You are a safety classifier. Classify if the message is SAFE or UNSAFE.
UNSAFE means: hate speech, harassment, humiliation, abuse, sexual content, violence, self-harm promotion, or completely off-topic non-medical content.
SAFE means: medical questions, symptoms, health advice, greetings, general health topics.
Reply with only one word: SAFE or UNSAFE`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 10,
    });
    const result = safetyResponse.choices[0].message.content.trim().toUpperCase();
    return result.includes('SAFE') && !result.includes('UNSAFE');
  } catch (error) {
    console.log('Safety check failed, defaulting to safe:', error.message);
    return true;
  }
}

// ✅ Advanced Multi-Model Routing
function selectModel(lastMessage, language) {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'cant breathe',
    'emergency', 'unconscious', 'heavy bleeding', 'suicide',
    'overdose', 'seizure', 'severe pain', 'critical', '112',
    'dying', 'fainted', 'collapse', 'not breathing',
    'सीने में दर्द', 'दिल का दौरा', 'सांस नहीं',
    'বুকে ব্যথা', 'হার্ট অ্যাটাক',
    'ألم في الصدر', 'نوبة قلبية'
  ];

  const complexKeywords = [
    'diabetes', 'blood pressure', 'hypertension', 'cancer',
    'chronic', 'diagnosis', 'treatment', 'surgery', 'tumor',
    'prescription', 'autoimmune', 'neurological', 'cardiac',
    'kidney', 'liver', 'thyroid', 'arthritis', 'depression',
    'anxiety disorder', 'mental health', 'psychiatric'
  ];

  const symptomKeywords = [
    'fever', 'headache', 'cough', 'cold', 'pain',
    'diarrhea', 'vomit', 'nausea', 'rash', 'tired',
    'fatigue', 'injury', 'wound', 'swelling', 'ache',
    'sore throat', 'runny nose', 'stomach', 'back pain'
  ];

  const isEmergency = emergencyKeywords.some(k => lastMessage.includes(k));
  const isComplex = complexKeywords.some(k => lastMessage.includes(k));
  const isSymptom = symptomKeywords.some(k => lastMessage.includes(k));
  const isMultilingual = language !== 'english';

  if (isEmergency) {
    console.log('🚨 Using GPT-OSS 120B — Emergency');
    return 'openai/gpt-oss-120b';
  } else if (isComplex) {
    console.log('🧠 Using DeepSeek R1 — Complex medical reasoning');
    return 'deepseek-r1-distill-llama-70b';
  } else if (isMultilingual) {
    console.log(`🌍 Using Qwen3 32B — ${language} language`);
    return 'qwen/qwen3-32b';
  } else if (isSymptom) {
    console.log('🏥 Using LLaMA 3.3 70b — Symptom case');
    return 'llama-3.3-70b-versatile';
  } else {
    console.log('💬 Using LLaMA 3.1 8b — General');
    return 'llama-3.1-8b-instant';
  }
}

// ✅ Language Response Prompt
function getLanguagePrompt(language) {
  const prompts = {
    hindi: '\n\nIMPORTANT: Respond ONLY in Hindi (Devanagari script).',
    bengali: '\n\nIMPORTANT: Respond ONLY in Bengali script.',
    arabic: '\n\nIMPORTANT: Respond ONLY in Arabic.',
    urdu: '\n\nIMPORTANT: Respond ONLY in Urdu script.',
    chinese: '\n\nIMPORTANT: Respond ONLY in Chinese.',
    japanese: '\n\nIMPORTANT: Respond ONLY in Japanese.',
    korean: '\n\nIMPORTANT: Respond ONLY in Korean.',
    gujarati: '\n\nIMPORTANT: Respond ONLY in Gujarati script.',
    telugu: '\n\nIMPORTANT: Respond ONLY in Telugu script.',
    tamil: '\n\nIMPORTANT: Respond ONLY in Tamil script.',
    malayalam: '\n\nIMPORTANT: Respond ONLY in Malayalam script.',
    punjabi: '\n\nIMPORTANT: Respond ONLY in Punjabi (Gurmukhi script).',
    odia: '\n\nIMPORTANT: Respond ONLY in Odia script.',
    kannada: '\n\nIMPORTANT: Respond ONLY in Kannada script.',
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
    english: ''
  };
  return prompts[language] || '\n\nIMPORTANT: Detect the user language and respond in that same language.';
}

// ✅ Doctor-Level System Prompt
const SYSTEM_PROMPT = `You are Dr. MediBot, an AI medical assistant with the knowledge of a senior physician with 30 years of experience across internal medicine, emergency medicine, and general practice.

Your approach:
1. Warmly greet the patient and make them feel comfortable
2. Systematically gather symptoms - ask ONE question at a time
3. Ask about: duration, severity (1-10), location, what makes it better/worse
4. Ask about age, gender, existing conditions, current medications
5. ALWAYS ask about allergies before mentioning any medication
6. Think through differential diagnoses systematically (never state definitive diagnosis)
7. Give evidence-based advice backed by WHO guidelines when available
8. Provide practical home remedies and first-aid when appropriate
9. For emergencies: IMMEDIATELY urge calling 112 or going to ER
10. Always end with recommending professional medical consultation
11. NEVER recommend specific drug doses
12. NEVER diagnose definitively - always say "possible" or "could be"
13. Always remind the user you are an AI assistant, not a real doctor
14. Be warm, empathetic, calm, and easy to understand
15. Never use medical jargon without explaining it simply
16. If user writes in another language, respond in that same language
17. For mental health concerns, be extra gentle and supportive
18. Never provide information that could be used for self-harm
19. If someone asks non-medical or inappropriate questions, politely redirect
20. If someone seems in crisis, provide emergency resources immediately`;

app.post('/chat', async (req, res) => {
  try {
    const { messages, patient } = req.body;

    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';

    // ✅ Step 1: Safety check
    const safe = await isSafeMessage(lastUserMessage);
    if (!safe) {
      return res.json({
        reply: "I'm Dr. MediBot, here to help with medical questions only. I noticed your message wasn't related to health topics or contained inappropriate content. Please feel free to ask me about any symptoms, health concerns, or medical questions. I'm here to help! 🏥",
        modelUsed: 'safety-filter',
        whoGuidelinesUsed: false
      });
    }

    // ✅ Step 2: Language — use preference or auto-detect
    const preferredLanguage = patient?.language;
    const language = (preferredLanguage && preferredLanguage !== 'auto')
      ? preferredLanguage
      : detectLanguage(lastUserMessage);
    console.log(`🌍 Language: ${language} (${!preferredLanguage || preferredLanguage === 'auto' ? 'auto-detected' : 'user preference'})`);

    // ✅ Step 3: Select best model
    const selectedModel = selectModel(lastUserMessage.toLowerCase(), language);

    // ✅ Step 4: Get WHO guidelines
    const ragContext = buildRAGContext(lastUserMessage);

    // ✅ Step 5: Build enhanced system prompt
    const patientContext = patient?.name
      ? `\n\nPatient Info: Name: ${patient.name}, Age: ${patient.age || 'unknown'}, Gender: ${patient.gender || 'unknown'}`
      : '';

    const enhancedSystemPrompt =
      SYSTEM_PROMPT +
      patientContext +
      getLanguagePrompt(language) +
      ragContext;

    // ✅ Step 6: Get AI response
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    res.json({
      reply,
      modelUsed: selectedModel,
      language,
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
  console.log('✅ MediBot — 7 Models + 28 Languages + Safety + RAG');
});