const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const oldStep5 = "    // Step 5: Patient context";
const newStep5 = `    // Step 5: Patient context + Long-term Memory
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const memoryKey = patient?.name ? 'patient_' + patient.name.toLowerCase().replace(/\\s/g, '_') : 'ip_' + ip;
    await updatePatientProfile(memoryKey, {
      conditions: [],
      symptoms: [],
      allergies: [],
      language,
      intent: intentResult.intent
    });
    const longTermContext = await buildLongTermContext(memoryKey);
    // Step 5: Patient context`;

content = content.replace(oldStep5, newStep5);

// Add longTermContext to prompt
const oldPrompt = "      patientContext +";
const newPrompt = `      patientContext +
      longTermContext +`;

content = content.replace(oldPrompt, newPrompt);

fs.writeFileSync('server.js', content);
console.log('Done!');