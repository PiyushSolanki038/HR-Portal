const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We regex match the exact div we injected
  const startDiv = `<div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 12 }}>\\s*<table style={{ minWidth: 580, width: '100%' }}>`;
  const endDiv = `</table>\\s*</div>`;
  
  if (content.match(new RegExp(startDiv, 'g'))) {
    content = content.replace(new RegExp(startDiv, 'g'), '<table style={{ minWidth: 600, width: \'100%\' }}>');
    content = content.replace(new RegExp(endDiv, 'g'), '</table>');
  }

  // Handle the specific one in HRDashboardView and Employees which had different minWidth before
  const otherStartDiv = `<div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 12 }}>\\s*<table`;
  
  // Actually, a simpler regex is just removing the start wrapper and the end wrapper
  content = content.replace(/<div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 12 }}>\s*<table([^>]*)>/g, '<table$1>');
  
  // But wait, we added `</table>\n</div>` exactly
  content = content.replace(/<\/table>\s*<\/div>/g, '</table>');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Un-Fixed tables in ' + file);
  }
});
