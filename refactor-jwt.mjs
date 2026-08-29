import fs from 'fs';
import path from 'path';

const searchPaths = [
  'server/api',
  'server/middleware'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (content.includes('generateToken(') && !content.includes('await generateToken(')) {
    content = content.replace(/generateToken\(/g, 'await generateToken(');
    changed = true;
  }
  
  if (content.includes('getUserFromEvent(') && !content.includes('await getUserFromEvent(')) {
    content = content.replace(/getUserFromEvent\(/g, 'await getUserFromEvent(');
    changed = true;
  }
  
  if (content.includes('verifyToken(') && !content.includes('await verifyToken(')) {
    content = content.replace(/verifyToken\(/g, 'await verifyToken(');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

for (const p of searchPaths) {
  walkDir(path.resolve(process.cwd(), p));
}
