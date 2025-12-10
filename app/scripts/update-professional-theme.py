#!/usr/bin/env python3
"""
Professional Orange Theme Updater for HAOS.fm Studios Section
Replaces emojis with FontAwesome icons and applies consistent orange branding
"""

import re

# Read the index.html file
with open('/Users/haos/azure-psql-app/app/public/index.html', 'r') as f:
    content = f.read()

# Define the old pattern (simplified to match just the emoji and color)
replacements = [
    # Modular Workspace
    (r'<div class="text-4xl">🔧</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #9D4EDD, #7209B7\);">MODULAR</span>',
     '<div class="text-5xl"><i class="fas fa-project-diagram" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">MODULAR</span>'),
    
    (r'style="color: #9D4EDD;">Modular Workspace',
     'style="color: #FF6B35;">Modular Workspace'),
    
    # ARP 2600
    (r'<div class="text-4xl">🎹</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #00D9FF, #39FF14\);">CLASSIC</span>',
     '<div class="text-5xl"><i class="fas fa-sliders-h" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">CLASSIC</span>'),
    
    (r'style="color: #00D9FF;">ARP 2600',
     'style="color: #FF6B35;">ARP 2600'),
    
    # Unified Studio  
    (r'<div class="text-4xl">🎚️</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #FF006E, #FB5607\);">UNIFIED</span>',
     '<div class="text-5xl"><i class="fas fa-th-large" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">UNIFIED</span>'),
    
    (r'style="color: #FF006E;">Unified Studio',
     'style="color: #FF6B35;">Unified Studio'),
    
    # Patch Sequencer
    (r'<div class="text-4xl">🔀</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #FFD700, #FFA500\);">ADVANCED</span>',
     '<div class="text-5xl"><i class="fas fa-sitemap" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">ADVANCED</span>'),
    
    (r'style="color: #FFD700;">Patch Sequencer',
     'style="color: #FF6B35;">Patch Sequencer'),
    
    # Techno Creator
    (r'<div class="text-4xl">⚡</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #39FF14, #00FF00\);">TECHNO</span>',
     '<div class="text-5xl"><i class="fas fa-bolt" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">TECHNO</span>'),
    
    (r'style="color: #39FF14;">Techno Creator',
     'style="color: #FF6B35;">Techno Creator'),
    
    # Music Creator
    (r'<div class="text-4xl">🎼</div>\s*<span class="haos-badge" style="background: linear-gradient\(135deg, #FF00FF, #00FFFF\);">DAW</span>',
     '<div class="text-5xl"><i class="fas fa-music" style="color: #FF6B35;"></i></div>\n                            <span class="haos-badge" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #000; font-weight: 700;">DAW</span>'),
    
    (r'style="color: #FF00FF;">Music Creator',
     'style="color: #FF6B35;">Music Creator'),
]

# Apply replacements
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Write back
with open('/Users/haos/azure-psql-app/app/public/index.html', 'w') as f:
    f.write(content)

print("✅ Professional orange theme applied successfully!")
print("📊 Replacements made:")
for i, (pattern, _) in enumerate(replacements, 1):
    print(f"   {i}. {pattern[:50]}...")
