#!/usr/bin/env node

/**
 * Script to update frontend configuration for Render backend
 * Usage: node update-frontend-for-render.js YOUR_RENDER_URL
 * Example: node update-frontend-for-render.js https://boom-booking-backend-xxxx.onrender.com
 */

import fs from 'fs';
import path from 'path';

const renderUrl = process.argv[2];

if (!renderUrl) {
  console.log('❌ Please provide the Render backend URL');
  console.log('Usage: node update-frontend-for-render.js YOUR_RENDER_URL');
  console.log('Example: node update-frontend-for-render.js https://boom-booking-backend-xxxx.onrender.com');
  process.exit(1);
}

// Validate URL format
if (!renderUrl.startsWith('https://') || !renderUrl.includes('.onrender.com')) {
  console.log('❌ Invalid Render URL format');
  console.log('Expected format: https://your-service-name.onrender.com');
  process.exit(1);
}

console.log(`🚀 Updating frontend configuration for Render backend: ${renderUrl}`);

// Update apiConfig.js
const apiConfigPath = 'src/utils/apiConfig.js';
const apiConfigContent = `// Utility function to get API base URL from environment variables
export const getApiBaseUrl = () => {
  // Check for production backend URL first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    // Use the Render backend URL
    return '${renderUrl}/api';
  }
  
  // Development fallback
  return 'http://localhost:5001/api';
};

// Utility function to get WebSocket URL from environment variables
export const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  if (import.meta.env.PROD) {
    return '${renderUrl}';
  }
  
  return 'http://localhost:5001';
};`;

try {
  fs.writeFileSync(apiConfigPath, apiConfigContent);
  console.log('✅ Updated src/utils/apiConfig.js');
} catch (error) {
  console.log('❌ Failed to update apiConfig.js:', error.message);
}

// Update vercel.json environment variables
const vercelConfigPath = 'vercel.json';
try {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // Update environment variables
  vercelConfig.env = {
    ...vercelConfig.env,
    VITE_API_BASE_URL: `${renderUrl}/api`,
    VITE_WS_URL: renderUrl,
    VITE_APP_NAME: "Boom Karaoke Booking",
    VITE_APP_VERSION: "1.0.0"
  };
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Updated vercel.json environment variables');
} catch (error) {
  console.log('❌ Failed to update vercel.json:', error.message);
}

console.log('\n🎉 Frontend configuration updated successfully!');
console.log('\n📋 Next steps:');
console.log('1. Commit and push these changes:');
console.log('   git add .');
console.log('   git commit -m "Update frontend to use Render backend"');
console.log('   git push origin main');
console.log('\n2. Vercel will automatically redeploy with the new backend URL');
console.log('\n3. Test your app to ensure it connects to the Render backend');
console.log('\n🔗 Your backend URL: ' + renderUrl);
