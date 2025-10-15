#!/usr/bin/env node

/**
 * Railway Deployment Setup Script
 * This script helps set up the database and environment for Railway deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up RafaLeads for Railway deployment...\n');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Platform: ${isRailway ? 'Railway' : 'Local'}\n`);

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Push database schema (only if DATABASE_URL is available)
  if (process.env.DATABASE_URL) {
    console.log('🗄️  Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema pushed\n');
  } else {
    console.log('⚠️  Skipping database schema push - DATABASE_URL not available during build\n');
  }

  // Seed database if in production and no data exists
  if (isProduction) {
    console.log('🌱 Checking if database needs seeding...');
    try {
      // Try to seed the database
      execSync('node scripts/seed-database.js', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully\n');
    } catch (error) {
      console.log('ℹ️  Database may already be seeded or seeding failed (this is okay)\n');
    }
  }

  // Note: Clinic sync service can be started manually via API
  if (isProduction) {
    console.log('ℹ️  Clinic sync service can be started via: POST /api/sync/clinics');
  }

  console.log('🎉 Deployment setup complete!');
  console.log('Your app should now be ready to run on Railway.');

} catch (error) {
  console.error('❌ Deployment setup failed:', error.message);
  process.exit(1);
}
