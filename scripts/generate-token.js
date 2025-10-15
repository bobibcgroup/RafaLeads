#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate a secure random token for dashboard access
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} - Random token string
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a token with clinic information
 * @param {string} clinicId - Clinic ID
 * @param {string} clinicName - Clinic Name
 * @returns {Object} - Token data
 */
function generateTokenData(clinicId, clinicName) {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
  
  return {
    token,
    clinic_id: clinicId,
    clinic_name: clinicName,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    active: true
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node generate-token.js <clinic-id> <clinic-name>');
    console.log('Example: node generate-token.js clinic-001 "Dr. Smith\'s Clinic"');
    process.exit(1);
  }
  
  const [clinicId, clinicName] = args;
  const tokenData = generateTokenData(clinicId, clinicName);
  
  console.log('\n🔐 Dashboard Token Generated\n');
  console.log('Token:', tokenData.token);
  console.log('Clinic ID:', tokenData.clinic_id);
  console.log('Clinic Name:', tokenData.clinic_name);
  console.log('Created:', tokenData.created_at);
  console.log('Expires:', tokenData.expires_at);
  console.log('\n📋 Add this to your Google Sheets dashboard_tokens tab:');
  console.log(`${tokenData.token}\t${tokenData.clinic_id}\t${tokenData.created_at}\t${tokenData.expires_at}\tTRUE`);
  console.log('\n🌐 Dashboard URL:');
  console.log(`http://localhost:3000/dashboard/${tokenData.token}`);
  console.log('\n');
}

module.exports = {
  generateToken,
  generateTokenData
};
