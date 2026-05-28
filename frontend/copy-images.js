const fs = require('fs');
const path = require('path');

const src = 'C:/Users/apurb/.gemini/antigravity/brain/23ed27ad-1085-472e-8d82-f65c05357d4f';
const dst = path.join(__dirname, 'public', 'images');

// Ensure directory exists
if (!fs.existsSync(dst)) {
  fs.mkdirSync(dst, { recursive: true });
}

const files = [
  ['hero_background_1779980811458.png', 'hero-bg.png'],
  ['feature_ai_analysis_1779980827282.png', 'feature-ai.png'],
  ['feature_reports_1779980846039.png', 'feature-reports.png'],
  ['feature_security_1779980861298.png', 'feature-security.png'],
  ['section_upload_1779980878160.png', 'section-upload.png'],
  ['section_brain_analysis_1779980895841.png', 'section-brain.png'],
];

files.forEach(([srcName, dstName]) => {
  const srcPath = path.join(src, srcName);
  const dstPath = path.join(dst, dstName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, dstPath);
    console.log(`✓ Copied ${dstName}`);
  } else {
    console.log(`✗ Missing ${srcName}`);
  }
});

// Copy logo
const logoSrc = 'd:/NeuroAI/backend/src/public/neuroai.png';
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(dst, 'logo.png'));
  console.log('✓ Copied logo.png');
}

console.log('\nDone! All images copied to public/images/');
