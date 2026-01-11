/**
 * Bundle Analyzer Script
 *
 * Analyzes bundle size and provides insights for optimization
 * Run with: node scripts/analyze-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size...\n');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // Check if .next directory exists
  const nextDir = path.join(__dirname, '..', '.next');
  if (!fs.existsSync(nextDir)) {
    console.error('❌ Build failed or .next directory not found');
    process.exit(1);
  }

  console.log('\n✅ Build completed successfully!');
  console.log('\n📊 Bundle size analysis:');
  console.log('   - Check .next/static/chunks/ for chunk sizes');
  console.log('   - Use browser DevTools Network tab to see actual load sizes');
  console.log('   - Consider using @next/bundle-analyzer for detailed analysis\n');

  // List chunk files
  const chunksDir = path.join(nextDir, 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    if (jsFiles.length > 0) {
      console.log('📁 Main chunks:');
      jsFiles
        .map((file) => {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          };
        })
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((file) => {
          console.log(
            `   ${file.name.padEnd(40)} ${file.sizeKB.padStart(8)} KB (${file.sizeMB} MB)`
          );
        });
    }
  }

  console.log('\n💡 Optimization tips:');
  console.log('   1. Use dynamic imports for heavy components');
  console.log('   2. Import only needed functions from libraries (tree shaking)');
  console.log('   3. Check for duplicate dependencies');
  console.log('   4. Consider code splitting for routes');
  console.log('   5. Use Next.js Image component for images\n');
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}
