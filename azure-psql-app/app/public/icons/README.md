# App Icons

This directory contains the app icons for the Progressive Web App (PWA).

## Icon Sizes

The following icon sizes are required:
- 72x72 - Android Chrome
- 96x96 - Android Chrome, Windows
- 128x128 - Android Chrome
- 144x144 - Android Chrome, Windows
- 152x152 - iOS Safari
- 192x192 - Android Chrome (standard)
- 384x384 - Android Chrome
- 512x512 - Android Chrome (high-res), splash screens

## Generating Icons

### Option 1: Using ImageMagick (if installed)
```bash
cd /Users/haos/Projects/azure-psql-app/app/public/icons

# Convert SVG to different sizes
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} app-icon.svg icon-${size}x${size}.png
done
```

### Option 2: Using Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload `app-icon.svg`
3. Download the generated icon pack
4. Extract PNG files to this directory

### Option 3: Using Node.js (sharp library)
```bash
npm install sharp
node generate-icons.js
```

### Option 4: Manual (Figma/Sketch/Photoshop)
1. Open `app-icon.svg` in your design tool
2. Export at each required size
3. Save as PNG with transparency

## Maskable Icons

For better Android support, create maskable variants with safe zone padding:
- 20% padding on all sides
- Content should be within central 80% circle
- Background should extend to edges

## Testing

Test your icons at: https://manifest-validator.appspot.com/

## Current Status

- ✅ SVG template created (app-icon.svg)
- ⏳ PNG icons need to be generated (use one of the methods above)
- ⏳ Maskable icons optional but recommended

## Quick Setup

If you don't have ImageMagick or design tools, you can use placeholder icons temporarily:
The SVG will render in most browsers, but PNG files are recommended for better compatibility.
