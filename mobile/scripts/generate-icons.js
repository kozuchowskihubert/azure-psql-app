#!/usr/bin/env node

/**
 * Generate HAOS.fm App Icons
 * Creates all required icon sizes for iOS and Android
 */

const fs = require('fs');
const path = require('path');

// SVG icon template - HAOS.fm logo
const generateSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ff94;stop-opacity:0.2" />
      <stop offset="50%" style="stop-color:#00ff94;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#00ff94;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)" rx="180"/>
  
  <!-- Glow effect -->
  <circle cx="512" cy="512" r="400" fill="url(#glow)" opacity="0.3"/>
  
  <!-- Main logo circle -->
  <circle cx="512" cy="512" r="350" fill="none" stroke="#00ff94" stroke-width="20"/>
  
  <!-- Waveform visualization -->
  <path d="M 300 512 Q 350 400, 400 512 T 500 512 T 600 512 T 700 512" 
        fill="none" stroke="#00ff94" stroke-width="25" stroke-linecap="round"/>
  
  <!-- Text HAOS -->
  <text x="512" y="680" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="140" 
        font-weight="bold" 
        fill="#00ff94" 
        text-anchor="middle">
    HAOS
  </text>
  
  <!-- Subtitle .fm -->
  <text x="512" y="760" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="60" 
        fill="#666" 
        text-anchor="middle">
    .fm
  </text>
  
  <!-- Corner decorations (synth knobs style) -->
  <circle cx="200" cy="200" r="40" fill="#1a1a1a" stroke="#00ff94" stroke-width="4"/>
  <circle cx="824" cy="200" r="40" fill="#1a1a1a" stroke="#00ff94" stroke-width="4"/>
  <circle cx="200" cy="824" r="40" fill="#1a1a1a" stroke="#00ff94" stroke-width="4"/>
  <circle cx="824" cy="824" r="40" fill="#1a1a1a" stroke="#00ff94" stroke-width="4"/>
</svg>
`;

// Create assets directory
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate main icon
const iconSVG = generateSVG(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSVG);

console.log('✓ Generated icon.svg');
console.log('\nTo convert SVG to PNG, use one of these methods:');
console.log('\n1. Online converter: https://cloudconvert.com/svg-to-png');
console.log('2. ImageMagick: convert icon.svg -resize 1024x1024 icon.png');
console.log('3. Inkscape: inkscape icon.svg --export-png=icon.png -w 1024 -h 1024');
console.log('\nRequired sizes:');
console.log('- iOS: 1024x1024 (icon.png)');
console.log('- Android: 1024x1024 (icon.png)');
console.log('- Android Adaptive: 1024x1024 (adaptive-icon.png)');
console.log('- Splash: 1242x2436 (splash.png)');

// Create README for assets
const assetsREADME = `# HAOS.fm App Assets

## Required Files

### App Icons
- \`icon.png\` - 1024x1024px (iOS & Android)
- \`adaptive-icon.png\` - 1024x1024px (Android adaptive icon)
- \`favicon.png\` - 48x48px (Web)

### Splash Screen
- \`splash.png\` - 1242x2436px (iPhone 11 Pro Max)

## Generating Icons

1. **Convert SVG to PNG**:
   \`\`\`bash
   # Using ImageMagick
   convert icon.svg -resize 1024x1024 icon.png
   
   # Or use online tool
   # https://cloudconvert.com/svg-to-png
   \`\`\`

2. **Generate all sizes** (optional):
   \`\`\`bash
   # iOS sizes
   convert icon.png -resize 20x20 icon-20.png
   convert icon.png -resize 29x29 icon-29.png
   convert icon.png -resize 40x40 icon-40.png
   convert icon.png -resize 60x60 icon-60.png
   convert icon.png -resize 76x76 icon-76.png
   convert icon.png -resize 83.5x83.5 icon-83.5.png
   convert icon.png -resize 1024x1024 icon-1024.png
   
   # Android sizes
   convert icon.png -resize 48x48 icon-48.png
   convert icon.png -resize 72x72 icon-72.png
   convert icon.png -resize 96x96 icon-96.png
   convert icon.png -resize 144x144 icon-144.png
   convert icon.png -resize 192x192 icon-192.png
   \`\`\`

## Design Guidelines

### Colors
- **Primary**: #00ff94 (HAOS Green)
- **Background**: #0a0a0a (Dark)
- **Accent**: #1a1a1a (Dark Gray)

### Style
- Dark theme with neon green accents
- Professional audio production aesthetic
- Minimalist, clean design
- Waveform visualization elements

## File Sizes
- Maximum file size: 1MB per image
- Format: PNG with transparency (except splash)
- Color space: sRGB

## Testing
Test icons on:
- [ ] iOS Simulator (various devices)
- [ ] Android Emulator (various devices)
- [ ] Real iPhone device
- [ ] Real Android device
- [ ] App Store Connect preview
- [ ] Google Play Console preview
`;

fs.writeFileSync(path.join(assetsDir, 'README.md'), assetsREADME);
console.log('\n✓ Created assets/README.md');
