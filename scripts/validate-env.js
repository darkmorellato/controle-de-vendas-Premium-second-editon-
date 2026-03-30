#!/usr/bin/env node
/**
 * Environment Validation Script
 * Validates required environment variables before starting the app
 */

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const optionalVars = [
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_VAPID_KEY'
];

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('📋 Required variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ❌ ${varName} - NOT FOUND`);
    hasErrors = true;
  }
});

// Check optional variables
console.log('\n📋 Optional variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ⚪ ${varName} - Not set (optional)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Environment validation FAILED');
  console.log('\nPlease create a .env file with the required variables:');
  console.log('  cp .env.example .env');
  process.exit(1);
} else {
  console.log('✅ Environment validation PASSED');
  process.exit(0);
}