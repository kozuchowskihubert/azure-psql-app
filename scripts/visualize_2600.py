#!/usr/bin/env python3
"""
Behringer 2600 Ultra-HD Visualization System
Using advanced rendering techniques for photorealistic synthesis
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import colorsys
import json
from pathlib import Path

class Behringer2600Visualizer:
    """
    Advanced visualization system for Behringer 2600
    Supports ultra-HD rendering with frequency mapping
    """
    
    def __init__(self, width=4096, height=2160):
        """Initialize 4K Ultra HD canvas"""
        self.width = width
        self.height = height
        self.canvas = Image.new('RGBA', (width, height), (10, 10, 10, 255))
        self.draw = ImageDraw.Draw(self.canvas)
        
        # Behringer 2600 specifications
        self.specs = {
            'vco1': {'freq': 440, 'range': (20, 10000), 'color': (80, 80, 80)},
            'vco2': {'freq': 442, 'range': (20, 10000), 'color': (80, 80, 80)},
            'vco3': {'freq': 220, 'range': (20, 10000), 'color': (80, 80, 80)},
            'vcf': {'freq': 1000, 'range': (20, 20000), 'color': (90, 90, 90)},
            'vca': {'level': 0.8, 'color': (90, 90, 90)},
            'adsr': {'a': 10, 'd': 100, 's': 0.7, 'r': 200, 'color': (80, 80, 80)},
            'lfo': {'freq': 2, 'range': (0.03, 30), 'color': (80, 88, 120)},
            'ringmod': {'color': (80, 88, 120)},
            'noise': {'color': (96, 96, 96)},
            'samplehold': {'color': (80, 88, 120)},
        }
        
        # Module positions (scaled to canvas)
        self.module_positions = {
            'vco1': (int(width * 0.15), int(height * 0.25)),
            'vco2': (int(width * 0.30), int(height * 0.25)),
            'vco3': (int(width * 0.45), int(height * 0.25)),
            'mixer': (int(width * 0.58), int(height * 0.30)),
            'vcf': (int(width * 0.70), int(height * 0.30)),
            'adsr': (int(width * 0.82), int(height * 0.35)),
            'vca': (int(width * 0.90), int(height * 0.25)),
            'lfo': (int(width * 0.20), int(height * 0.55)),
            'ringmod': (int(width * 0.50), int(height * 0.60)),
            'samplehold': (int(width * 0.65), int(height * 0.60)),
            'noise': (int(width * 0.80), int(height * 0.60)),
        }
        
        # Patch bay matrix (86 points)
        self.patch_points = self.generate_patch_matrix()
        
    def generate_patch_matrix(self):
        """Generate 86 patch points in organized matrix"""
        points = []
        rows = 6
        cols_per_row = [14, 14, 15, 15, 14, 14]
        
        start_y = int(self.height * 0.75)
        spacing_y = int(self.height * 0.03)
        
        for row_idx, col_count in enumerate(cols_per_row):
            y = start_y + row_idx * spacing_y
            start_x = int(self.width * 0.1)
            spacing_x = int(self.width * 0.8) // col_count
            
            for col in range(col_count):
                x = start_x + col * spacing_x
                points.append((x, y))
        
        return points
    
    def render_base_panel(self):
        """Render base panel with realistic materials"""
        # Wooden base
        wood_color = (74, 52, 34)  # Walnut brown
        self.draw.rectangle([0, 0, self.width, self.height], fill=wood_color)
        
        # Add wood grain texture
        self._add_wood_grain()
        
        # Control panel (light gray aluminum)
        panel_margin = int(self.width * 0.02)
        panel_rect = [
            panel_margin,
            int(self.height * 0.1),
            self.width - panel_margin,
            int(self.height * 0.7)
        ]
        self.draw.rectangle(panel_rect, fill=(200, 200, 200))
        
        # Add metallic shine
        self._add_metallic_gradient(panel_rect)
        
    def _add_wood_grain(self):
        """Add realistic wood grain texture"""
        grain = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        grain_draw = ImageDraw.Draw(grain)
        
        for i in range(50):
            x = np.random.randint(0, self.width)
            y1 = np.random.randint(0, self.height)
            y2 = np.random.randint(0, self.height)
            opacity = np.random.randint(10, 40)
            grain_draw.line([(x, y1), (x, y2)], fill=(0, 0, 0, opacity), width=2)
        
        self.canvas = Image.alpha_composite(self.canvas, grain)
        
    def _add_metallic_gradient(self, rect):
        """Add metallic shine gradient"""
        x1, y1, x2, y2 = rect
        gradient = Image.new('RGBA', (x2-x1, y2-y1), (255, 255, 255, 0))
        
        for y in range(y2-y1):
            alpha = int(30 * np.sin(y / (y2-y1) * np.pi))
            ImageDraw.Draw(gradient).line(
                [(0, y), (x2-x1, y)],
                fill=(255, 255, 255, alpha)
            )
        
        self.canvas.paste(gradient, (x1, y1), gradient)
        
    def render_modules(self):
        """Render all synthesizer modules with accurate colors"""
        for module_name, pos in self.module_positions.items():
            if module_name in self.specs:
                color = self.specs[module_name]['color']
                self._render_module(module_name, pos, color)
                
    def _render_module(self, name, pos, color):
        """Render individual module section"""
        x, y = pos
        width = int(self.width * 0.12)
        height = int(self.height * 0.15)
        
        # Module background
        self.draw.rectangle(
            [x - width//2, y - height//2, x + width//2, y + height//2],
            fill=color,
            outline=(42, 42, 42),
            width=3
        )
        
        # Add module label
        try:
            font_size = int(self.height * 0.02)
            # Use default font if custom not available
            self.draw.text(
                (x, y - height//2 + 20),
                name.upper(),
                fill=(255, 255, 255),
                anchor='mm'
            )
        except:
            pass
        
        # Add knobs
        knob_count = 3 if 'vco' in name else 2
        for i in range(knob_count):
            knob_x = x - width//4 + i * width//4
            knob_y = y + height//4
            self._render_knob(knob_x, knob_y)
            
    def _render_knob(self, x, y, size=None):
        """Render realistic knob with indicator"""
        if size is None:
            size = int(self.height * 0.025)
            
        # Knob base (black plastic)
        self.draw.ellipse(
            [x - size, y - size, x + size, y + size],
            fill=(15, 15, 15),
            outline=(50, 50, 50),
            width=2
        )
        
        # Knob top (lighter)
        top_size = int(size * 0.8)
        self.draw.ellipse(
            [x - top_size, y - top_size, x + top_size, y + top_size],
            fill=(31, 31, 31)
        )
        
        # White indicator line
        angle = np.random.uniform(0, 2 * np.pi)
        ind_len = size * 0.7
        ind_x = x + np.cos(angle) * ind_len
        ind_y = y + np.sin(angle) * ind_len
        self.draw.line(
            [(x, y), (ind_x, ind_y)],
            fill=(255, 255, 255),
            width=3
        )
        
    def render_patch_bay(self):
        """Render patch bay with 86 connection points"""
        # Patch bay background
        bay_rect = [
            int(self.width * 0.05),
            int(self.height * 0.72),
            int(self.width * 0.95),
            int(self.height * 0.95)
        ]
        self.draw.rectangle(bay_rect, fill=(42, 42, 42))
        
        # Render patch points
        for x, y in self.patch_points:
            self._render_patch_point(x, y)
            
    def _render_patch_point(self, x, y):
        """Render individual 3.5mm patch jack"""
        size = int(self.height * 0.012)
        
        # Outer socket (chrome)
        self.draw.ellipse(
            [x - size, y - size, x + size, y + size],
            fill=(136, 136, 136),
            outline=(88, 88, 88),
            width=1
        )
        
        # Inner contact (darker)
        inner_size = int(size * 0.6)
        self.draw.ellipse(
            [x - inner_size, y - inner_size, x + inner_size, y + inner_size],
            fill=(26, 26, 26)
        )
        
    def render_cables(self, num_cables=12):
        """Render realistic patch cables"""
        cable_colors = [
            (255, 0, 0),     # Red
            (0, 0, 255),     # Blue
            (255, 255, 0),   # Yellow
            (0, 255, 0),     # Green
            (255, 0, 255),   # Magenta
            (0, 255, 255),   # Cyan
            (255, 102, 0),   # Orange
            (150, 75, 0),    # Brown
            (255, 20, 147),  # Pink
            (65, 105, 225),  # Royal Blue
            (255, 215, 0),   # Gold
            (50, 205, 50),   # Lime
        ]
        
        for i in range(min(num_cables, len(self.patch_points) - 1)):
            start_idx = np.random.randint(0, len(self.patch_points) - 10)
            end_idx = start_idx + np.random.randint(5, 15)
            
            if end_idx < len(self.patch_points):
                start_pos = self.patch_points[start_idx]
                end_pos = self.patch_points[end_idx]
                color = cable_colors[i % len(cable_colors)]
                
                self._render_cable(start_pos, end_pos, color)
                
    def _render_cable(self, start, end, color):
        """Render curved patch cable"""
        x1, y1 = start
        x2, y2 = end
        
        # Calculate control points for Bezier curve
        mid_y = min(y1, y2) - int(self.height * 0.08)
        
        # Generate Bezier curve points
        points = []
        steps = 50
        for t in np.linspace(0, 1, steps):
            # Quadratic Bezier
            x = (1-t)**2 * x1 + 2*(1-t)*t * (x1+x2)//2 + t**2 * x2
            y = (1-t)**2 * y1 + 2*(1-t)*t * mid_y + t**2 * y2
            points.append((int(x), int(y)))
        
        # Draw cable with thickness
        for i in range(len(points) - 1):
            self.draw.line([points[i], points[i+1]], fill=color, width=8)
            
        # Draw cable ends (jacks)
        for pos in [start, end]:
            self._render_cable_jack(pos, color)
            
    def _render_cable_jack(self, pos, color):
        """Render cable jack connector"""
        x, y = pos
        size = int(self.height * 0.015)
        
        # Chrome jack body
        self.draw.ellipse(
            [x - size, y - size, x + size, y + size],
            fill=(136, 136, 136),
            outline=(88, 88, 88),
            width=2
        )
        
        # Color ring indicator
        ring_size = int(size * 1.3)
        self.draw.ellipse(
            [x - ring_size, y - ring_size, x + ring_size, y + ring_size],
            outline=color,
            width=4
        )
        
    def add_branding(self):
        """Add Behringer logo and model designation"""
        # Behringer logo area (blue bar)
        logo_rect = [
            int(self.width * 0.1),
            int(self.height * 0.08),
            int(self.width * 0.4),
            int(self.height * 0.12)
        ]
        self.draw.rectangle(logo_rect, fill=(30, 95, 168))
        
        # "BEHRINGER" text
        try:
            logo_center = (int(self.width * 0.25), int(self.height * 0.10))
            self.draw.text(
                logo_center,
                "BEHRINGER",
                fill=(255, 255, 255),
                anchor='mm'
            )
        except:
            pass
        
        # "2600" model designation
        model_rect = [
            int(self.width * 0.45),
            int(self.height * 0.08),
            int(self.width * 0.65),
            int(self.height * 0.12)
        ]
        self.draw.rectangle(model_rect, fill=(255, 255, 255))
        
        try:
            model_center = (int(self.width * 0.55), int(self.height * 0.10))
            self.draw.text(
                model_center,
                "2600",
                fill=(0, 0, 0),
                anchor='mm'
            )
        except:
            pass
        
    def add_frequency_visualization(self, module='vco1'):
        """Add real-time frequency visualization overlay"""
        if module not in self.specs:
            return
            
        spec = self.specs[module]
        freq = spec['freq']
        min_freq, max_freq = spec['range']
        
        # Calculate waveform
        x_pos, y_pos = self.module_positions.get(module, (self.width//2, self.height//2))
        
        # Generate sine wave at frequency
        wave_width = int(self.width * 0.1)
        wave_height = int(self.height * 0.05)
        
        points = []
        samples = 100
        periods = 3
        
        for i in range(samples):
            t = i / samples * periods
            x = x_pos - wave_width//2 + i * wave_width // samples
            y = y_pos + int(wave_height * np.sin(2 * np.pi * t))
            points.append((x, y))
        
        # Draw waveform
        for i in range(len(points) - 1):
            self.draw.line([points[i], points[i+1]], fill=(0, 212, 255), width=3)
            
    def apply_post_processing(self):
        """Apply realistic lighting and effects"""
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(self.canvas)
        self.canvas = enhancer.enhance(1.15)
        
        # Sharpen
        self.canvas = self.canvas.filter(ImageFilter.SHARPEN)
        
        # Subtle blur for realism
        self.canvas = self.canvas.filter(ImageFilter.GaussianBlur(radius=0.5))
        
    def render_full_synth(self, output_path='behringer_2600_ultra_hd.png'):
        """Render complete synthesizer with all details"""
        print("🎨 Rendering Behringer 2600 Ultra HD...")
        
        # Build layers
        print("  ├─ Base panel...")
        self.render_base_panel()
        
        print("  ├─ Modules...")
        self.render_modules()
        
        print("  ├─ Patch bay (86 points)...")
        self.render_patch_bay()
        
        print("  ├─ Patch cables...")
        self.render_cables()
        
        print("  ├─ Branding...")
        self.add_branding()
        
        print("  ├─ Frequency visualization...")
        self.add_frequency_visualization('vco1')
        self.add_frequency_visualization('vcf')
        
        print("  ├─ Post-processing...")
        self.apply_post_processing()
        
        print(f"  └─ Saving to {output_path}...")
        self.canvas.save(output_path, 'PNG', quality=100, optimize=False)
        
        print(f"✅ Rendered {self.width}x{self.height} image successfully!")
        print(f"📊 File size: {Path(output_path).stat().st_size / (1024*1024):.2f} MB")
        
        return output_path
    
    def export_frequency_map(self, output_path='frequency_map.json'):
        """Export frequency mapping data"""
        freq_data = {
            'specifications': self.specs,
            'module_positions': {k: list(v) for k, v in self.module_positions.items()},
            'patch_points': [list(p) for p in self.patch_points],
            'total_patch_points': len(self.patch_points),
            'canvas_size': [self.width, self.height]
        }
        
        with open(output_path, 'w') as f:
            json.dump(freq_data, f, indent=2)
            
        print(f"📄 Frequency map exported to {output_path}")
        return freq_data


def main():
    """Main execution function"""
    print("=" * 60)
    print("🎛️  BEHRINGER 2600 ULTRA-HD VISUALIZER")
    print("=" * 60)
    
    # Create 4K visualizer
    visualizer = Behringer2600Visualizer(width=4096, height=2160)
    
    # Render full synthesizer
    image_path = visualizer.render_full_synth('behringer_2600_4k.png')
    
    # Export frequency mapping
    freq_map = visualizer.export_frequency_map()
    
    print("\n✨ Rendering complete!")
    print(f"📸 Image: {image_path}")
    print(f"🎵 VCO1: {freq_map['specifications']['vco1']['freq']} Hz")
    print(f"🎵 VCO2: {freq_map['specifications']['vco2']['freq']} Hz")
    print(f"🎵 VCO3: {freq_map['specifications']['vco3']['freq']} Hz")
    print(f"🔊 VCF: {freq_map['specifications']['vcf']['freq']} Hz cutoff")
    print(f"🌊 LFO: {freq_map['specifications']['lfo']['freq']} Hz")
    
    return visualizer


if __name__ == '__main__':
    viz = main()
