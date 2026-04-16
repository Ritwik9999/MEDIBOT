const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

// ✅ Connect to MongoDB
async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db('medibot');
      console.log('✅ MongoDB connected successfully!');
    }
    return db;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return null;
  }
}

// ✅ Get patient profile
async function getPatientProfile(key) {
  try {
    const database = await connectDB();
    if (!database) return null;
    const patients = database.collection('patients');
    return await patients.findOne({ key });
  } catch (error) {
    console.log('Memory get error:', error.message);
    return null;
  }
}

// ✅ Update patient profile
async function updatePatientProfile(key, data) {
  try {
    const database = await connectDB();
    if (!database) return null;

    const patients = database.collection('patients');
    const existing = await patients.findOne({ key }) || {
      key,
      conditions: [],
      symptoms: [],
      allergies: [],
      visits: 0,
      firstSeen: new Date().toISOString(),
      consultations: []
    };

    if (data.conditions) {
      data.conditions.forEach(c => {
        if (!existing.conditions.includes(c)) existing.conditions.push(c);
      });
    }

    if (data.symptoms) {
      data.symptoms.forEach(s => {
        if (!existing.symptoms.includes(s)) existing.symptoms.push(s);
      });
    }

    if (data.allergies) {
      data.allergies.forEach(a => {
        if (!existing.allergies.includes(a)) existing.allergies.push(a);
      });
    }

    existing.visits = (existing.visits || 0) + 1;
    existing.lastSeen = new Date().toISOString();
    existing.language = data.language || existing.language;

    if (!existing.consultations) existing.consultations = [];
    existing.consultations.push({
      date: new Date().toISOString(),
      symptoms: data.symptoms || [],
      intent: data.intent || 'GENERAL'
    });
    if (existing.consultations.length > 5) {
      existing.consultations = existing.consultations.slice(-5);
    }

    await patients.updateOne(
      { key },
      { $set: existing },
      { upsert: true }
    );

    console.log(`💾 Patient profile saved to MongoDB: ${key}`);
    return existing;
  } catch (error) {
    console.log('Memory update error:', error.message);
    return null;
  }
}

// ✅ Build long-term context
async function buildLongTermContext(key) {
  try {
    const profile = await getPatientProfile(key);
    if (!profile || profile.visits <= 1) return '';

    let context = '\n\nLONG-TERM PATIENT HISTORY (from MongoDB):';

    if (profile.conditions && profile.conditions.length > 0) {
      context += `\n- Chronic conditions: ${profile.conditions.join(', ')}`;
    }
    if (profile.allergies && profile.allergies.length > 0) {
      context += `\n- Known allergies: ${profile.allergies.join(', ')}`;
    }
    if (profile.visits > 1) {
      context += `\n- Total visits: ${profile.visits}`;
    }
    if (profile.consultations && profile.consultations.length > 0) {
      const lastConsult = profile.consultations[profile.consultations.length - 1];
      context += `\n- Last visit: ${new Date(lastConsult.date).toLocaleDateString()}`;
      if (lastConsult.symptoms.length > 0) {
        context += ` | Symptoms: ${lastConsult.symptoms.join(', ')}`;
      }
    }

    context += '\nProvide personalized care based on this history.';
    return context;
  } catch (error) {
    return '';
  }
}

module.exports = { updatePatientProfile, buildLongTermContext, getPatientProfile };