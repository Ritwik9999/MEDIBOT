const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// Replace existing markdown removal with better version
const oldMarkdown = "reply = reply.replace(/\\*\\*(.*?)\\*\\*/g, '$1');\n    reply = reply.replace(/\\*(.*?)\\*/g, '$1');\n    reply = reply.replace(/#{1,6}\\s/g, '');";

const newMarkdown = `// Remove all markdown formatting
    reply = reply.replace(/\\*\\*(.*?)\\*\\*/g, '$1');
    reply = reply.replace(/\\*(.*?)\\*/g, '$1');
    reply = reply.replace(/#{1,6}\\s/g, '');
    reply = reply.replace(/\\|/g, '');
    reply = reply.replace(/---+/g, '');
    reply = reply.replace(/<br>/g, '\\n');
    reply = reply.replace(/^\\s*[-*]\\s/gm, '- ');`;

if (content.includes(oldMarkdown)) {
  content = content.replace(oldMarkdown, newMarkdown);
  console.log('DONE: Updated markdown removal');
} else {
  console.log('Old markdown not found, trying alternative...');
  // Just add after think tag removal
  const thinkReplace = "reply = reply.replace(/<think>[\\s\\S]*/g, '').trim();\n    }";
  const newThinkReplace = thinkReplace + `\n    // Remove all markdown formatting
    reply = reply.replace(/\\*\\*(.*?)\\*\\*/g, '$1');
    reply = reply.replace(/\\*(.*?)\\*/g, '$1');
    reply = reply.replace(/#{1,6}\\s/g, '');
    reply = reply.replace(/\\|/g, '');
    reply = reply.replace(/---+/g, '');
    reply = reply.replace(/<br>/g, '\\n');`;
  content = content.replace(thinkReplace, newThinkReplace);
  console.log('DONE: Added markdown removal after think tags');
}

fs.writeFileSync('backend/server.js', content);
console.log('✅ Markdown fix complete!');