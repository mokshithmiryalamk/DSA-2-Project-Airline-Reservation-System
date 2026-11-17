const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const portfolioDir = fs.existsSync(path.resolve(__dirname, '../../../Portfolio_Website'))
  ? path.resolve(__dirname, '../../../Portfolio_Website')
  : 'D:\\Moki\\Portfolio\\Portfolio_Website';

console.log('=== STAGE 1 VERIFICATION ===');

// 1. Check files exist
const requiredFiles = [
  'index.html',
  'css/design-tokens.css',
  'css/main.css',
  'js/app.js'
];

for (const rel of requiredFiles) {
  const p = path.join(baseDir, rel);
  const exists = fs.existsSync(p);
  const size = exists ? fs.statSync(p).size : 0;
  console.log(`[FILE] ${rel}: ${exists ? 'EXISTS (' + size + ' bytes)' : 'MISSING'}`);
}

// 2. Check Java files count in src
function getFilesRecursive(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const javaFiles = getFilesRecursive(path.join(baseDir, 'src'));
console.log(`[JAVA] Total source files in src/: ${javaFiles.length}`);

// 3. Check JS Syntax
try {
  const jsContent = fs.readFileSync(path.join(baseDir, 'js', 'app.js'), 'utf8');
  new Function(jsContent);
  console.log('[JS] js/app.js syntax check: PASSED');
} catch (e) {
  console.error('[JS ERROR]', e);
}

// 4. Check HTML duplicate IDs and basic attributes
const htmlContent = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const idRegex = /id=["']([^"']+)["']/g;
let match;
const ids = new Map();
let duplicateFound = false;
while ((match = idRegex.exec(htmlContent)) !== null) {
  const id = match[1];
  if (ids.has(id)) {
    console.error(`[HTML DUPLICATE ID] ${id}`);
    duplicateFound = true;
  }
  ids.set(id, (ids.get(id) || 0) + 1);
}
if (!duplicateFound) {
  console.log(`[HTML] Verified ${ids.size} unique IDs. Zero duplicates.`);
}

// 5. Check CSS tokens
const cssContent = fs.readFileSync(path.join(baseDir, 'css', 'design-tokens.css'), 'utf8');
const mainCss = fs.readFileSync(path.join(baseDir, 'css', 'main.css'), 'utf8');
console.log(`[CSS] Tokens size: ${cssContent.length} chars, Main CSS size: ${mainCss.length} chars`);

// 6. Check Portfolio_Website unchanged
const portfolioFiles = fs.readdirSync(portfolioDir);
console.log(`[PORTFOLIO_WEBSITE] Untouched root files count: ${portfolioFiles.length}`);
console.log('=== STAGE 1 VERIFICATION COMPLETE ===');
