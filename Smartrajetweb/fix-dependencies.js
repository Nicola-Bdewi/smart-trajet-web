const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing dependency issues...');

try {
  // Remove problematic files
  if (fs.existsSync('node_modules')) {
    console.log('🗑️  Removing node_modules...');
    execSync('Remove-Item -Recurse -Force node_modules', { shell: 'powershell' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️  Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }

  // Install with legacy peer deps
  console.log('📦 Installing dependencies with legacy peer deps...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // Install specific versions of problematic packages
  console.log('🔧 Installing specific package versions...');
  execSync('npm install metro@0.80.0 metro-config@0.80.0 ajv@8.12.0 ajv-keywords@5.1.0 --save-dev --legacy-peer-deps', { stdio: 'inherit' });

  console.log('✅ Dependencies fixed! You can now run: npm run web');
} catch (error) {
  console.error('❌ Error fixing dependencies:', error.message);
  process.exit(1);
} 