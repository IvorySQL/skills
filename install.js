#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'skills');
const dest = path.join(process.cwd(), 'skills');

if (!fs.existsSync(src)) {
  console.error('Error: skills directory not found.');
  process.exit(1);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Also copy .claude-plugin if present
const pluginSrc = path.join(__dirname, '.claude-plugin');
const pluginDest = path.join(process.cwd(), '.claude-plugin');

console.log('IvorySQL Skills Installer');
console.log('=============================');
console.log('');
console.log('Copying skills to: ' + dest);
copyDir(src, dest);

if (fs.existsSync(pluginSrc)) {
  console.log('Copying plugin config to: ' + pluginDest);
  copyDir(pluginSrc, pluginDest);
}

console.log('');
console.log('Done! 22 skills installed.');
console.log('Try: /ivorysql in Claude Code to verify.');
