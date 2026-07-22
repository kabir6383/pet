const { spawn } = require('child_process');

console.log('\n🚀 Starting Performance Evaluation Tool (PET) Services...\n');

// 1. Start Backend Express + SQLite Server on port 5000
const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Vite Dev Server on port 3000
const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

// Handle graceful termination
function shutdown() {
  console.log('\nStopping PET services...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
