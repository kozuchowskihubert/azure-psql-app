/**
 * HAOS.fm Cable Router
 * Visual patch bay system with drag-and-drop cable routing
 * 
 * Features:
 * - Drag cables between modules
 * - Visual connection rendering
 * - Real-time audio routing
 * - Save/recall patch states
 */

class CableRouter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cables = [];
        this.dragStart = null;
        this.dragEnd = null;
        this.isDragging = false;
        
        // Connection points registry
        this.outputs = new Map();
        this.inputs = new Map();
        
        // Visual settings
        this.cableColors = {
            audio: '#FF6B35',
            cv: '#39FF14',
            gate: '#00D9FF',
            active: '#FF8C42'
        };
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        // Resize canvas to fill container
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.redraw();
        };
        
        window.addEventListener('resize', resize);
        resize();
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
    }
    
    /**
     * Register an output jack
     */
    registerOutput(id, x, y, type = 'audio', label = '') {
        this.outputs.set(id, { id, x, y, type, label, element: null });
        this.redraw();
    }
    
    /**
     * Register an input jack
     */
    registerInput(id, x, y, type = 'audio', label = '') {
        this.inputs.set(id, { id, x, y, type, label, element: null });
        this.redraw();
    }
    
    /**
     * Connect output to input
     */
    connect(outputId, inputId) {
        const output = this.outputs.get(outputId);
        const input = this.inputs.get(inputId);
        
        if (!output || !input) {
            console.warn('Invalid connection:', outputId, '->', inputId);
            return false;
        }
        
        // Check if already connected
        const existing = this.cables.find(c => 
            c.output === outputId && c.input === inputId
        );
        
        if (existing) {
            console.warn('Already connected');
            return false;
        }
        
        // Create cable
        const cable = {
            id: `cable-${Date.now()}`,
            output: outputId,
            input: inputId,
            type: output.type,
            active: false
        };
        
        this.cables.push(cable);
        this.redraw();
        
        // Dispatch event for audio engine
        this.dispatchConnectionEvent('connect', cable);
        
        return true;
    }
    
    /**
     * Disconnect cable
     */
    disconnect(cableId) {
        const index = this.cables.findIndex(c => c.id === cableId);
        if (index === -1) return false;
        
        const cable = this.cables[index];
        this.cables.splice(index, 1);
        this.redraw();
        
        // Dispatch event
        this.dispatchConnectionEvent('disconnect', cable);
        
        return true;
    }
    
    /**
     * Get cable at position
     */
    getCableAt(x, y, tolerance = 10) {
        for (const cable of this.cables) {
            const output = this.outputs.get(cable.output);
            const input = this.inputs.get(cable.input);
            
            if (!output || !input) continue;
            
            // Check if point is near cable path
            const dist = this.distanceToQuadraticCurve(
                x, y,
                output.x, output.y,
                input.x, input.y
            );
            
            if (dist < tolerance) {
                return cable;
            }
        }
        
        return null;
    }
    
    /**
     * Get jack at position
     */
    getJackAt(x, y, radius = 15) {
        // Check outputs
        for (const [id, jack] of this.outputs) {
            const dx = x - jack.x;
            const dy = y - jack.y;
            if (Math.sqrt(dx*dx + dy*dy) < radius) {
                return { type: 'output', jack };
            }
        }
        
        // Check inputs
        for (const [id, jack] of this.inputs) {
            const dx = x - jack.x;
            const dy = y - jack.y;
            if (Math.sqrt(dx*dx + dy*dy) < radius) {
                return { type: 'input', jack };
            }
        }
        
        return null;
    }
    
    /**
     * Mouse handlers
     */
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const jack = this.getJackAt(x, y);
        
        if (jack && jack.type === 'output') {
            this.isDragging = true;
            this.dragStart = jack.jack;
            this.dragEnd = { x, y };
        }
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragEnd = { x, y };
        this.redraw();
        this.drawDragCable();
    }
    
    onMouseUp(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const jack = this.getJackAt(x, y);
        
        if (jack && jack.type === 'input' && this.dragStart) {
            // Valid connection
            this.connect(this.dragStart.id, jack.jack.id);
        }
        
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.redraw();
    }
    
    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cable = this.getCableAt(x, y);
        if (cable) {
            this.disconnect(cable.id);
        }
    }
    
    /**
     * Drawing functions
     */
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cables
        this.cables.forEach(cable => this.drawCable(cable));
        
        // Draw jacks
        this.outputs.forEach(jack => this.drawJack(jack, 'output'));
        this.inputs.forEach(jack => this.drawJack(jack, 'input'));
    }
    
    drawCable(cable) {
        const output = this.outputs.get(cable.output);
        const input = this.inputs.get(cable.input);
        
        if (!output || !input) return;
        
        const ctx = this.ctx;
        const color = cable.active ? this.cableColors.active : this.cableColors[cable.type];
        
        // Draw shadow
        ctx.shadowColor = color;
        ctx.shadowBlur = cable.active ? 15 : 8;
        
        // Draw cable as bezier curve
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = cable.active ? 4 : 3;
        ctx.lineCap = 'round';
        
        const cpOffset = Math.abs(input.x - output.x) * 0.5;
        ctx.moveTo(output.x, output.y);
        ctx.bezierCurveTo(
            output.x + cpOffset, output.y,
            input.x - cpOffset, input.y,
            input.x, input.y
        );
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    drawDragCable() {
        if (!this.dragStart || !this.dragEnd) return;
        
        const ctx = this.ctx;
        const color = this.cableColors[this.dragStart.type];
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 5]);
        
        const cpOffset = Math.abs(this.dragEnd.x - this.dragStart.x) * 0.5;
        ctx.moveTo(this.dragStart.x, this.dragStart.y);
        ctx.bezierCurveTo(
            this.dragStart.x + cpOffset, this.dragStart.y,
            this.dragEnd.x - cpOffset, this.dragEnd.y,
            this.dragEnd.x, this.dragEnd.y
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
    }
    
    drawJack(jack, type) {
        const ctx = this.ctx;
        const color = this.cableColors[jack.type];
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(jack.x, jack.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner dot
        ctx.beginPath();
        ctx.arc(jack.x, jack.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Label
        if (jack.label) {
            ctx.font = '10px "Space Mono", monospace';
            ctx.fillStyle = '#888';
            ctx.textAlign = type === 'output' ? 'right' : 'left';
            ctx.fillText(
                jack.label,
                type === 'output' ? jack.x - 18 : jack.x + 18,
                jack.y + 4
            );
        }
    }
    
    /**
     * Utility: Distance to quadratic bezier curve
     */
    distanceToQuadraticCurve(px, py, x1, y1, x2, y2) {
        const steps = 20;
        let minDist = Infinity;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const cpOffset = Math.abs(x2 - x1) * 0.5;
            
            // Bezier curve point at t
            const x = Math.pow(1-t, 3)*x1 + 
                     3*Math.pow(1-t, 2)*t*(x1 + cpOffset) +
                     3*(1-t)*Math.pow(t, 2)*(x2 - cpOffset) +
                     Math.pow(t, 3)*x2;
                     
            const y = Math.pow(1-t, 3)*y1 + 
                     3*Math.pow(1-t, 2)*t*y1 +
                     3*(1-t)*Math.pow(t, 2)*y2 +
                     Math.pow(t, 3)*y2;
            
            const dx = px - x;
            const dy = py - y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < minDist) minDist = dist;
        }
        
        return minDist;
    }
    
    /**
     * Dispatch custom event for audio routing
     */
    dispatchConnectionEvent(type, cable) {
        const event = new CustomEvent('haos-cable-' + type, {
            detail: {
                cable,
                output: this.outputs.get(cable.output),
                input: this.inputs.get(cable.input)
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * Export/Import patch state
     */
    exportPatch() {
        return {
            cables: this.cables.map(c => ({
                output: c.output,
                input: c.input,
                type: c.type
            }))
        };
    }
    
    importPatch(patchData) {
        this.cables = [];
        
        if (patchData.cables) {
            patchData.cables.forEach(c => {
                this.connect(c.output, c.input);
            });
        }
    }
    
    /**
     * Clear all cables
     */
    clear() {
        this.cables = [];
        this.redraw();
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CableRouter;
}
