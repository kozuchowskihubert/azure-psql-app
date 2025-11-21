#!/usr/bin/env node

/**
 * Icon Generator for PWA
 * Generates PNG icons from SVG source in multiple sizes
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = __dirname;
const svgPath = path.join(iconsDir, 'app-icon.svg');

console.log('🎨 Generating PWA icons...\n');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
  console.log('✅ Using sharp for high-quality image conversion\n');
} catch (err) {
  console.log('⚠️  sharp not found. Install with: npm install sharp');
  console.log('💡 Creating placeholder instructions instead...\n');
}

if (sharp && fs.existsSync(svgPath)) {
  // Generate icons using sharp
  Promise.all(
    sizes.map(async (size) => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      try {
        await sharp(svgPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✅ Generated icon-${size}x${size}.png`);
      } catch (err) {
        console.error(`❌ Failed to generate ${size}x${size}:`, err.message);
      }
    })
  ).then(() => {
    console.log('\n✨ Icon generation complete!');
  }).catch((err) => {
    console.error('\n❌ Icon generation failed:', err);
  });
} else {
  // Create placeholder script
  console.log('📝 Creating placeholder icons using data URIs...\n');
  
  // For now, we'll update manifest to use SVG or create minimal placeholders
  console.log('To generate icons, you can:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run this script again: node generate-icons.js');
  console.log('3. Or use an online tool: https://realfavicongenerator.net/');
  console.log('4. Or use ImageMagick (see README.md)');
  
  // Create a simple placeholder HTML file to convert manually
  const placeholderHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Icon Converter</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    canvas { border: 1px solid #ccc; margin: 10px; }
    button { background: #667eea; color: white; border: none; padding: 10px 20px; 
             border-radius: 5px; cursor: pointer; margin: 5px; }
    button:hover { background: #764ba2; }
  </style>
</head>
<body>
  <h1>Manual Icon Generator</h1>
  <p>This page helps you generate PNG icons from the SVG if you don't have sharp installed.</p>
  
  <div id="canvases"></div>
  <button onclick="downloadAll()">Download All Icons</button>
  
  <script>
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const svgData = \`${fs.readFileSync(svgPath, 'utf8')}\`;
    
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
      sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        
        const container = document.createElement('div');
        container.innerHTML = \`<h3>\${size}x\${size}</h3>\`;
        container.appendChild(canvas);
        
        const btn = document.createElement('button');
        btn.textContent = 'Download';
        btn.onclick = () => {
          canvas.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`icon-\${size}x\${size}.png\`;
            a.click();
          });
        };
        container.appendChild(btn);
        document.getElementById('canvases').appendChild(container);
      });
    };
    
    img.src = url;
    
    function downloadAll() {
      document.querySelectorAll('button').forEach((btn, i) => {
        if (i > 0) setTimeout(() => btn.click(), i * 500);
      });
    }
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(iconsDir, 'icon-converter.html'), placeholderHTML);
  console.log('\n✅ Created icon-converter.html');
  console.log('   Open this file in a browser to generate icons manually');
}
