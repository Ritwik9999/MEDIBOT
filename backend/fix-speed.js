const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Add fast greeting bypass BEFORE safety check in /chat route
const oldStep1 = "    // Step 1: Safety check";
const newStep1 = `    // ✅ Fast bypass for simple greetings (skip all AI calls)
    const greetings = ['hi', 'hii', 'hiii', 'hey', 'hello', 'howdy', 'good morning', 'good evening', 'thanks', 'thank you', 'ok', 'okay', 'bye', 'goodbye'];
    const isGreeting = greetings.includes(lastUserMessage.toLowerCase().trim());
    
    if (isGreeting) {
      console.log('⚡ INSTANT PATH → Greeting detected, skipping AI calls');
      const greetResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are Dr. MediBot, a friendly AI medical assistant. Respond warmly to greetings in 1-2 sentences. Ask how you can help with their health concerns. Respond ONLY in English unless the greeting is in another language.' },
          ...messages
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      let reply = greetResponse.choices[0].message.content;
      reply = reply.replace(/<think>[\\s\\S]*?<\\/think>/g, '').trim();
      if (reply.includes('<think>')) reply = reply.replace(/<think>[\\s\\S]*/g, '').trim();
      return res.json({
        reply,
        modelUsed: 'llama-3.1-8b-instant',
        language: 'english',
        intent: 'GREETING',
        routingPath: 'INSTANT',
        whoGuidelinesUsed: false
      });
    }

    // Step 1: Safety check`;

content = content.replace(oldStep1, newStep1);
fs.writeFileSync('backend/server.js', content);
console.log('Done! Fast greeting bypass added');