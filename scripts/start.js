#!/usr/bin/env node

/**
 * Custom start script for Railway deployment
 * Handles port configuration properly
 */

const { spawn } = require('child_process');

// Get port from environment variable or default to 3000
const port = process.env.PORT || process.env.RAILWAY_STATIC_PORT || 3000;

console.log(`🚀 Starting RafaLeads on port ${port}`);
console.log('🔍 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', port);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Start Next.js with the correct port
const nextProcess = spawn('npx', ['next', 'start', '-p', port.toString()], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port }
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});
