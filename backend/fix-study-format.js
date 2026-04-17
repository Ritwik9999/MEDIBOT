const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

const oldFormat = "Format: Clear sections. Use simple language but include proper medical terminology. Explain every medical term when first used.";
const newFormat = "Format: Use plain text only. NO markdown, NO tables, NO bold, NO headers, NO pipes. Use numbered lists and line breaks for structure. Write in clear paragraphs with numbered points. Keep it readable like a textbook chapter, not a formatted document.";

if (content.includes(oldFormat)) {
  content = content.replace(oldFormat, newFormat);
  console.log('DONE: Updated STUDY format to plain text');
} else {
  console.log('SKIP: Format text not found');
}

fs.writeFileSync('backend/server.js', content);
console.log('✅ Study format fix complete!');