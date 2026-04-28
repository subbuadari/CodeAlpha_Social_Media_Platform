const fs = require('fs');
const path = require('path');

const targets = [
  'stitch_mini_social_network',
  'frontend/style.css'
];

console.log('🧹 Starting cleanup...');

targets.forEach(target => {
  const targetPath = path.join(__dirname, target);
  if (fs.existsSync(targetPath)) {
    try {
      if (fs.lstatSync(targetPath).isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
      console.log(`✅ Removed: ${target}`);
    } catch (err) {
      console.error(`❌ Failed to remove ${target}:`, err.message);
    }
  } else {
    console.log(`ℹ️ Already removed: ${target}`);
  }
});

console.log('✨ Cleanup complete!');
