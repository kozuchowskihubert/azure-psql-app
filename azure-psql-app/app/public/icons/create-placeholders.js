#!/usr/bin/env node

/**
 * Quick Placeholder Icon Generator
 * Creates simple PNG placeholders using canvas in Node
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Creating minimal PNG placeholders...\n');

// Try using canvas if available
try {
  const { createCanvas } = require('canvas');
  
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    
    // Draw rounded rectangle
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Draw note icon
    const noteWidth = size * 0.5;
    const noteHeight = size * 0.6;
    const noteX = (size - noteWidth) / 2;
    const noteY = (size - noteHeight) / 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(noteX, noteY, noteWidth, noteHeight);
    
    // Draw lines on note
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = size * 0.01;
    const lineY1 = noteY + noteHeight * 0.3;
    const lineY2 = noteY + noteHeight * 0.5;
    const lineY3 = noteY + noteHeight * 0.7;
    const lineMargin = noteWidth * 0.15;
    
    ctx.beginPath();
    ctx.moveTo(noteX + lineMargin, lineY1);
    ctx.lineTo(noteX + noteWidth - lineMargin, lineY1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(noteX + lineMargin, lineY2);
    ctx.lineTo(noteX + noteWidth - lineMargin, lineY2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(noteX + lineMargin, lineY3);
    ctx.lineTo(noteX + noteWidth - lineMargin * 2, lineY3);
    ctx.stroke();
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), buffer);
    console.log(`✅ Created icon-${size}x${size}.png`);
  });
  
  console.log('\n✨ All placeholder icons created successfully!');
  
} catch (err) {
  console.log('⚠️  canvas module not found');
  console.log('📝 Installing canvas module for icon generation...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm install canvas', { stdio: 'inherit', cwd: path.join(__dirname, '../../..') });
    console.log('\n✅ Installed canvas. Please run this script again.');
  } catch (installErr) {
    console.log('\n⚠️  Could not install canvas automatically.');
    console.log('💡 Please use icon-converter.html in your browser instead.');
    console.log('   Or install manually: npm install canvas');
  }
}
