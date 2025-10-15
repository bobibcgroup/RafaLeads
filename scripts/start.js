#!/usr/bin/env node

/**
 * Custom start script for Railway deployment
 * Handles port configuration properly
 */

const { spawn } = require('child_process');

// Debug: Log all available environment variables
console.log('🔍 Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('RAILWAY_STATIC_PORT:', process.env.RAILWAY_STATIC_PORT);
console.log('RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN);

// Get port from environment variable or default to 3000
const port = process.env.PORT || process.env.RAILWAY_STATIC_PORT || 3000;

console.log(`🚀 Starting RafaLeads on port ${port}`);

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
