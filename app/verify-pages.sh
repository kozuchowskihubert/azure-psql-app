#!/bin/bash
# HAOS Platform - Page Verification Script
# Checks all pages linked from index.html for integrity

cd /Users/haos/azure-psql-app/app/public

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 HAOS Platform Page Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pages=(
    "haos-platform.html"
    "music-creator.html"
    "platform/studio.html"
    "radio.html"
    "synth-2600-studio.html"
    "synth-patch-sequencer.html"
    "techno-creator.html"
    "techno-workspace.html"
)

total=0
passed=0
failed=0

for page in "${pages[@]}"; do
    total=$((total + 1))
    echo ""
    echo "📄 Testing: $page"
    
    # Check if file exists
    if [ ! -f "$page" ]; then
        echo "   ❌ File not found!"
        failed=$((failed + 1))
        continue
    fi
    
    lines=$(wc -l < "$page")
    echo "   ✅ File exists ($lines lines)"
    
    # Check for required elements
    has_title=$(grep -c "<title>" "$page" || echo "0")
    has_body=$(grep -c "<body" "$page" || echo "0")
    has_haos=$(grep -c -i "haos" "$page" || echo "0")
    
    if [ "$has_title" -gt 0 ] && [ "$has_body" -gt 0 ]; then
        echo "   ✅ Valid HTML structure"
    else
        echo "   ⚠️  Missing HTML elements"
    fi
    
    # Check for script dependencies
    scripts=$(grep -o 'src="[^"]*\.js"' "$page" | wc -l || echo "0")
    if [ "$scripts" -gt 0 ]; then
        echo "   ✅ Includes $scripts JavaScript files"
        
        # Check if critical scripts exist
        while IFS= read -r script_tag; do
            script=$(echo "$script_tag" | sed 's/.*src="//;s/".*//')
            # Remove leading slash for relative path checking
            script_path=$(echo "$script" | sed 's/^\///')
            
            if [ -f "$script_path" ]; then
                echo "      ✓ $script"
            else
                echo "      ✗ MISSING: $script"
            fi
        done < <(grep -o 'src="[^"]*\.js"' "$page" | head -5)
    else
        echo "   ℹ️  No JavaScript dependencies"
    fi
    
    # Check for CSS
    css=$(grep -c "<style>" "$page" || echo "0")
    css_links=$(grep -c 'rel="stylesheet"' "$page" || echo "0")
    if [ "$css" -gt 0 ] || [ "$css_links" -gt 0 ]; then
        echo "   ✅ Has styling"
    fi
    
    passed=$((passed + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: $passed/$total pages verified"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check critical shared files
echo ""
echo "🔧 Checking shared resources..."

critical_files=(
    "js/haos-audio-engine.js"
    "js/state-manager.js"
    "js/theme-manager.js"
    "css/haos-brand.css"
    "data/factory-presets.json"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | awk '{print int($1/1024)"KB"}')
        echo "   ✅ $file ($size)"
    else
        echo "   ❌ MISSING: $file"
    fi
done

echo ""
echo "✅ Verification complete!"
