// Patch Editor - HAOS Platform
// Visual modular synthesis patching system with drag-drop and cable routing

// Module Database (matching module-browser.js)
const AVAILABLE_MODULES = [
    {
        id: 'waveshaper',
        name: 'Waveshaper',
        category: 'effect',
        icon: '🎚️',
        description: 'Distortion and waveshaping',
        inputs: [
            { id: 'audio_in', name: 'Audio In', type: 'audio' }
        ],
        outputs: [
            { id: 'audio_out', name: 'Audio Out', type: 'audio' }
        ],
        parameters: [
            { id: 'drive', name: 'Drive', min: 0, max: 100, default: 50, unit: '%' },
            { id: 'output', name: 'Output', min: 0, max: 100, default: 75, unit: '%' },
            { id: 'mix', name: 'Mix', min: 0, max: 100, default: 100, unit: '%' }
        ]
    },
    {
        id: 'phaser',
        name: 'Phaser',
        category: 'effect',
        icon: '🌊',
        description: 'Phase shifting effect',
        inputs: [
            { id: 'audio_in', name: 'Audio In', type: 'audio' },
            { id: 'rate_cv', name: 'Rate CV', type: 'cv' }
        ],
        outputs: [
            { id: 'audio_out', name: 'Audio Out', type: 'audio' }
        ],
        parameters: [
            { id: 'rate', name: 'Rate', min: 0.01, max: 10, default: 0.5, unit: 'Hz' },
            { id: 'depth', name: 'Depth', min: 0, max: 100, default: 50, unit: '%' },
            { id: 'feedback', name: 'Feedback', min: 0, max: 100, default: 30, unit: '%' },
            { id: 'stages', name: 'Stages', min: 2, max: 12, default: 4, unit: '' },
            { id: 'mix', name: 'Mix', min: 0, max: 100, default: 50, unit: '%' }
        ]
    },
    {
        id: 'delay',
        name: 'Stereo Delay',
        category: 'effect',
        icon: '🔁',
        description: 'Stereo/ping-pong delay',
        inputs: [
            { id: 'audio_l', name: 'Audio L', type: 'audio' },
            { id: 'audio_r', name: 'Audio R', type: 'audio' }
        ],
        outputs: [
            { id: 'audio_l', name: 'Audio L', type: 'audio' },
            { id: 'audio_r', name: 'Audio R', type: 'audio' }
        ],
        parameters: [
            { id: 'time', name: 'Time', min: 10, max: 2000, default: 500, unit: 'ms' },
            { id: 'feedback', name: 'Feedback', min: 0, max: 100, default: 40, unit: '%' },
            { id: 'mix', name: 'Mix', min: 0, max: 100, default: 30, unit: '%' }
        ]
    },
    {
        id: 'reverb',
        name: 'Reverb',
        category: 'effect',
        icon: '🏛️',
        description: 'Algorithmic reverb',
        inputs: [
            { id: 'audio_l', name: 'Audio L', type: 'audio' },
            { id: 'audio_r', name: 'Audio R', type: 'audio' }
        ],
        outputs: [
            { id: 'audio_l', name: 'Audio L', type: 'audio' },
            { id: 'audio_r', name: 'Audio R', type: 'audio' }
        ],
        parameters: [
            { id: 'size', name: 'Size', min: 0, max: 100, default: 50, unit: '%' },
            { id: 'damping', name: 'Damping', min: 0, max: 100, default: 50, unit: '%' },
            { id: 'mix', name: 'Mix', min: 0, max: 100, default: 25, unit: '%' }
        ]
    }
];

// State Management
const state = {
    modules: [],
    connections: [],
    selectedModule: null,
    selectedConnection: null,
    draggedModule: null,
    draggedLibraryModule: null,
    connectionDrag: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    gridSize: 20,
    showGrid: true,
    history: [],
    historyIndex: -1,
    nextModuleId: 1
};

// Canvas Setup
let canvas, ctx, canvasArea;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('patchCanvas');
    ctx = canvas.getContext('2d');
    canvasArea = document.getElementById('canvasArea');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    populateModuleLibrary();
    setupEventListeners();
    setupCategoryFilters();
    
    // Load saved patch from localStorage
    loadPatchFromStorage();
    
    // Start render loop
    requestAnimationFrame(renderLoop);
});

// Resize canvas to fill container
function resizeCanvas() {
    canvas.width = canvasArea.clientWidth;
    canvas.height = canvasArea.clientHeight;
}

// Populate module library
function populateModuleLibrary() {
    const container = document.getElementById('libraryModules');
    container.innerHTML = AVAILABLE_MODULES.map(module => `
        <div class="library-module" 
             draggable="true"
             data-module-id="${module.id}"
             data-category="${module.category}">
            <div class="library-module-header">
                <div class="library-module-icon ${module.category}">
                    ${module.icon}
                </div>
                <div class="library-module-name">${module.name}</div>
            </div>
            <div class="library-module-desc">${module.description}</div>
            <div class="library-module-stats">
                <span><i class="fas fa-arrow-down"></i> ${module.inputs.length}</span>
                <span><i class="fas fa-arrow-up"></i> ${module.outputs.length}</span>
                <span><i class="fas fa-cog"></i> ${module.parameters.length}</span>
            </div>
        </div>
    `).join('');
    
    // Add drag event listeners
    document.querySelectorAll('.library-module').forEach(el => {
        el.addEventListener('dragstart', handleLibraryDragStart);
        el.addEventListener('dragend', handleLibraryDragEnd);
    });
}

// Category Filtering
function setupCategoryFilters() {
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // Filter modules
            const category = tag.dataset.category;
            document.querySelectorAll('.library-module').forEach(module => {
                if (category === 'all' || module.dataset.category === category) {
                    module.style.display = 'block';
                } else {
                    module.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    document.getElementById('librarySearch').addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        document.querySelectorAll('.library-module').forEach(module => {
            const name = module.querySelector('.library-module-name').textContent.toLowerCase();
            const desc = module.querySelector('.library-module-desc').textContent.toLowerCase();
            module.style.display = (name.includes(search) || desc.includes(search)) ? 'block' : 'none';
        });
    });
}

// Library Drag Handlers
function handleLibraryDragStart(e) {
    state.draggedLibraryModule = e.target.dataset.moduleId;
    e.dataTransfer.effectAllowed = 'copy';
}

function handleLibraryDragEnd(e) {
    state.draggedLibraryModule = null;
}

// Setup Event Listeners
function setupEventListeners() {
    // Canvas drag & drop
    canvasArea.addEventListener('dragover', handleCanvasDragOver);
    canvasArea.addEventListener('drop', handleCanvasDrop);
    
    // Canvas mouse events
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Toolbar buttons
    document.getElementById('saveBtn').addEventListener('click', savePatch);
    document.getElementById('loadBtn').addEventListener('click', loadPatch);
    document.getElementById('clearBtn').addEventListener('click', clearPatch);
    document.getElementById('exportBtn').addEventListener('click', exportPatch);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('zoomInBtn').addEventListener('click', () => zoom(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoom(0.8));
    document.getElementById('fitBtn').addEventListener('click', fitToScreen);
    document.getElementById('gridBtn').addEventListener('click', toggleGrid);
    
    // Patch name auto-save
    document.getElementById('patchName').addEventListener('change', savePatchToStorage);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// Handle drag over canvas
function handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

// Handle drop on canvas
function handleCanvasDrop(e) {
    e.preventDefault();
    
    if (!state.draggedLibraryModule) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addModule(state.draggedLibraryModule, x, y);
    state.draggedLibraryModule = null;
}

// Add module to patch
function addModule(moduleTypeId, x, y) {
    const moduleType = AVAILABLE_MODULES.find(m => m.id === moduleTypeId);
    if (!moduleType) return;
    
    const module = {
        id: state.nextModuleId++,
        typeId: moduleTypeId,
        name: moduleType.name,
        category: moduleType.category,
        icon: moduleType.icon,
        x: x - 100, // Center on cursor
        y: y - 80,
        width: 200,
        height: Math.max(120, 60 + Math.max(moduleType.inputs.length, moduleType.outputs.length) * 24),
        inputs: moduleType.inputs.map(input => ({ ...input, connections: [] })),
        outputs: moduleType.outputs.map(output => ({ ...output, connections: [] })),
        parameters: moduleType.parameters.map(param => ({ ...param, value: param.default }))
    };
    
    state.modules.push(module);
    saveHistory();
    updateEmptyState();
    savePatchToStorage();
}

// Canvas Mouse Handlers
function handleCanvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a port
    const port = findPortAtPosition(x, y);
    if (port) {
        startConnectionDrag(port);
        return;
    }
    
    // Check if clicking on a module
    const module = findModuleAtPosition(x, y);
    if (module) {
        selectModule(module);
        state.draggedModule = {
            module: module,
            offsetX: x - module.x,
            offsetY: y - module.y
        };
    } else {
        deselectAll();
    }
}

function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle module dragging
    if (state.draggedModule) {
        const module = state.draggedModule.module;
        module.x = x - state.draggedModule.offsetX;
        module.y = y - state.draggedModule.offsetY;
        
        // Snap to grid
        if (state.showGrid) {
            module.x = Math.round(module.x / state.gridSize) * state.gridSize;
            module.y = Math.round(module.y / state.gridSize) * state.gridSize;
        }
    }
    
    // Handle connection dragging
    if (state.connectionDrag) {
        state.connectionDrag.endX = x;
        state.connectionDrag.endY = y;
    }
}

function handleCanvasMouseUp(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Complete connection
    if (state.connectionDrag) {
        const targetPort = findPortAtPosition(x, y);
        if (targetPort && canConnect(state.connectionDrag.port, targetPort)) {
            createConnection(state.connectionDrag.port, targetPort);
        }
        state.connectionDrag = null;
    }
    
    // Save module position
    if (state.draggedModule) {
        saveHistory();
        savePatchToStorage();
        state.draggedModule = null;
    }
}

function handleCanvasClick(e) {
    // Handled by mousedown/mouseup
}

// Find module at position
function findModuleAtPosition(x, y) {
    // Search in reverse order (top modules first)
    for (let i = state.modules.length - 1; i >= 0; i--) {
        const module = state.modules[i];
        if (x >= module.x && x <= module.x + module.width &&
            y >= module.y && y <= module.y + module.height) {
            return module;
        }
    }
    return null;
}

// Find port at position
function findPortAtPosition(x, y) {
    for (const module of state.modules) {
        // Check input ports
        for (let i = 0; i < module.inputs.length; i++) {
            const portX = module.x + 8;
            const portY = module.y + 60 + i * 24;
            const distance = Math.sqrt((x - portX) ** 2 + (y - portY) ** 2);
            if (distance < 12) {
                return { module, port: module.inputs[i], type: 'input', index: i };
            }
        }
        
        // Check output ports
        for (let i = 0; i < module.outputs.length; i++) {
            const portX = module.x + module.width - 8;
            const portY = module.y + 60 + i * 24;
            const distance = Math.sqrt((x - portX) ** 2 + (y - portY) ** 2);
            if (distance < 12) {
                return { module, port: module.outputs[i], type: 'output', index: i };
            }
        }
    }
    return null;
}

// Start connection drag
function startConnectionDrag(portInfo) {
    const module = portInfo.module;
    const isInput = portInfo.type === 'input';
    const index = portInfo.index;
    
    const portX = isInput ? module.x + 8 : module.x + module.width - 8;
    const portY = module.y + 60 + index * 24;
    
    state.connectionDrag = {
        port: portInfo,
        startX: portX,
        startY: portY,
        endX: portX,
        endY: portY
    };
}

// Check if two ports can be connected
function canConnect(port1, port2) {
    // Can't connect to same module
    if (port1.module === port2.module) return false;
    
    // Must be input -> output or output -> input
    if (port1.type === port2.type) return false;
    
    // Types must match
    if (port1.port.type !== port2.port.type) return false;
    
    // Check if connection already exists
    const existing = state.connections.find(c => 
        (c.from === port1 && c.to === port2) || (c.from === port2 && c.to === port1)
    );
    if (existing) return false;
    
    return true;
}

// Create connection
function createConnection(port1, port2) {
    // Ensure from is output and to is input
    const from = port1.type === 'output' ? port1 : port2;
    const to = port1.type === 'input' ? port1 : port2;
    
    const connection = {
        id: Date.now(),
        from: from,
        to: to,
        type: from.port.type
    };
    
    state.connections.push(connection);
    saveHistory();
    savePatchToStorage();
}

// Delete connection
function deleteConnection(connection) {
    const index = state.connections.indexOf(connection);
    if (index !== -1) {
        state.connections.splice(index, 1);
        saveHistory();
        savePatchToStorage();
    }
}

// Select module
function selectModule(module) {
    deselectAll();
    state.selectedModule = module;
    updatePropertiesPanel(module);
}

// Deselect all
function deselectAll() {
    state.selectedModule = null;
    updatePropertiesPanel(null);
}

// Update properties panel
function updatePropertiesPanel(module) {
    const content = document.getElementById('propertiesContent');
    
    if (!module) {
        content.innerHTML = `
            <p style="color: #6B6B6B; font-size: 13px; text-align: center; padding: 40px 20px;">
                Select a module to view its properties
            </p>
        `;
        return;
    }
    
    content.innerHTML = `
        <div class="property-group">
            <label class="property-label">Module Name</label>
            <input type="text" class="property-input" value="${module.name}" readonly>
        </div>
        
        <div class="property-group">
            <label class="property-label">Category</label>
            <input type="text" class="property-input" value="${module.category}" readonly>
        </div>
        
        <div class="property-group">
            <label class="property-label">Position</label>
            <div style="display: flex; gap: 8px;">
                <input type="number" class="property-input" value="${Math.round(module.x)}" 
                       onchange="updateModulePosition(${module.id}, 'x', this.value)" placeholder="X">
                <input type="number" class="property-input" value="${Math.round(module.y)}" 
                       onchange="updateModulePosition(${module.id}, 'y', this.value)" placeholder="Y">
            </div>
        </div>
        
        <h4 style="font-size: 12px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px;">
            Parameters
        </h4>
        
        ${module.parameters.map((param, i) => `
            <div class="property-group">
                <label class="property-label">${param.name}</label>
                <input type="range" class="property-slider" 
                       min="${param.min}" max="${param.max}" step="${(param.max - param.min) / 100}"
                       value="${param.value}"
                       oninput="updateParameter(${module.id}, ${i}, this.value)">
                <div class="property-value" id="param-value-${module.id}-${i}">
                    ${param.value.toFixed(2)} ${param.unit}
                </div>
            </div>
        `).join('')}
        
        <button class="btn btn-danger" style="width: 100%; margin-top: 24px;" 
                onclick="deleteModule(${module.id})">
            <i class="fas fa-trash"></i> Delete Module
        </button>
    `;
}

// Update module position
window.updateModulePosition = function(moduleId, axis, value) {
    const module = state.modules.find(m => m.id === moduleId);
    if (module) {
        module[axis] = parseFloat(value);
        saveHistory();
        savePatchToStorage();
    }
};

// Update parameter
window.updateParameter = function(moduleId, paramIndex, value) {
    const module = state.modules.find(m => m.id === moduleId);
    if (module && module.parameters[paramIndex]) {
        module.parameters[paramIndex].value = parseFloat(value);
        const valueEl = document.getElementById(`param-value-${moduleId}-${paramIndex}`);
        if (valueEl) {
            valueEl.textContent = `${parseFloat(value).toFixed(2)} ${module.parameters[paramIndex].unit}`;
        }
        savePatchToStorage();
    }
};

// Delete module
window.deleteModule = function(moduleId) {
    const index = state.modules.findIndex(m => m.id === moduleId);
    if (index !== -1) {
        // Remove connections
        state.connections = state.connections.filter(c => 
            c.from.module.id !== moduleId && c.to.module.id !== moduleId
        );
        
        state.modules.splice(index, 1);
        deselectAll();
        saveHistory();
        updateEmptyState();
        savePatchToStorage();
    }
};

// Render Loop
function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    drawConnections();
    
    // Draw connection being dragged
    if (state.connectionDrag) {
        drawCable(
            state.connectionDrag.startX,
            state.connectionDrag.startY,
            state.connectionDrag.endX,
            state.connectionDrag.endY,
            state.connectionDrag.port.port.type,
            0.5
        );
    }
    
    requestAnimationFrame(renderLoop);
}

// Draw all connections
function drawConnections() {
    for (const connection of state.connections) {
        const fromModule = connection.from.module;
        const toModule = connection.to.module;
        
        const fromX = fromModule.x + fromModule.width - 8;
        const fromY = fromModule.y + 60 + connection.from.index * 24;
        
        const toX = toModule.x + 8;
        const toY = toModule.y + 60 + connection.to.index * 24;
        
        drawCable(fromX, fromY, toX, toY, connection.type, 1);
    }
}

// Draw cable with Bezier curve
function drawCable(x1, y1, x2, y2, type, opacity = 1) {
    const colors = {
        audio: ['#FF6B35', '#D4AF37'],
        cv: ['#00D9FF', '#6A0DAD'],
        gate: ['#39FF14', '#3D5A3D']
    };
    
    const [color1, color2] = colors[type] || colors.audio;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Draw cable
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Bezier curve
    const dx = Math.abs(x2 - x1);
    const handleOffset = Math.min(dx * 0.5, 100);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
        x1 + handleOffset, y1,
        x2 - handleOffset, y2,
        x2, y2
    );
    ctx.stroke();
    
    // Draw glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color1;
    ctx.stroke();
    
    ctx.restore();
}

// Update empty state visibility
function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    emptyState.style.display = state.modules.length === 0 ? 'block' : 'none';
}

// Save/Load Functions
function savePatch() {
    const patchData = {
        name: document.getElementById('patchName').value,
        version: '1.0',
        created: new Date().toISOString(),
        modules: state.modules.map(m => ({
            id: m.id,
            typeId: m.typeId,
            x: m.x,
            y: m.y,
            parameters: m.parameters
        })),
        connections: state.connections.map(c => ({
            from: { moduleId: c.from.module.id, portId: c.from.port.id },
            to: { moduleId: c.to.module.id, portId: c.to.port.id },
            type: c.type
        }))
    };
    
    const blob = new Blob([JSON.stringify(patchData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patchData.name.replace(/\s+/g, '_')}.haos`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Patch saved successfully!', 'success');
}

function loadPatch() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.haos,.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const patchData = JSON.parse(event.target.result);
                loadPatchData(patchData);
                showNotification('Patch loaded successfully!', 'success');
            } catch (error) {
                showNotification('Failed to load patch file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function loadPatchData(patchData) {
    clearPatchSilent();
    
    // Load modules
    for (const moduleData of patchData.modules) {
        const moduleType = AVAILABLE_MODULES.find(m => m.id === moduleData.typeId);
        if (!moduleType) continue;
        
        const module = {
            id: moduleData.id,
            typeId: moduleData.typeId,
            name: moduleType.name,
            category: moduleType.category,
            icon: moduleType.icon,
            x: moduleData.x,
            y: moduleData.y,
            width: 200,
            height: Math.max(120, 60 + Math.max(moduleType.inputs.length, moduleType.outputs.length) * 24),
            inputs: moduleType.inputs.map(input => ({ ...input, connections: [] })),
            outputs: moduleType.outputs.map(output => ({ ...output, connections: [] })),
            parameters: moduleData.parameters
        };
        
        state.modules.push(module);
        state.nextModuleId = Math.max(state.nextModuleId, module.id + 1);
    }
    
    // Load connections
    for (const connData of patchData.connections) {
        const fromModule = state.modules.find(m => m.id === connData.from.moduleId);
        const toModule = state.modules.find(m => m.id === connData.to.moduleId);
        
        if (!fromModule || !toModule) continue;
        
        const fromPort = fromModule.outputs.find(p => p.id === connData.from.portId);
        const toPort = toModule.inputs.find(p => p.id === connData.to.portId);
        
        if (!fromPort || !toPort) continue;
        
        const fromIndex = fromModule.outputs.indexOf(fromPort);
        const toIndex = toModule.inputs.indexOf(toPort);
        
        createConnection(
            { module: fromModule, port: fromPort, type: 'output', index: fromIndex },
            { module: toModule, port: toPort, type: 'input', index: toIndex }
        );
    }
    
    document.getElementById('patchName').value = patchData.name;
    updateEmptyState();
    saveHistory();
}

function clearPatch() {
    if (state.modules.length === 0) return;
    
    if (confirm('Clear the entire patch? This cannot be undone.')) {
        clearPatchSilent();
        saveHistory();
        showNotification('Patch cleared', 'info');
    }
}

function clearPatchSilent() {
    state.modules = [];
    state.connections = [];
    deselectAll();
    updateEmptyState();
    savePatchToStorage();
}

function exportPatch() {
    showNotification('Export feature coming soon!', 'info');
}

// History Management
function saveHistory() {
    const snapshot = JSON.stringify({
        modules: state.modules,
        connections: state.connections
    });
    
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    state.historyIndex++;
    
    // Limit history to 50 steps
    if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
    }
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        const snapshot = JSON.parse(state.history[state.historyIndex]);
        state.modules = snapshot.modules;
        state.connections = snapshot.connections;
        deselectAll();
        updateEmptyState();
        showNotification('Undo', 'info');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const snapshot = JSON.parse(state.history[state.historyIndex]);
        state.modules = snapshot.modules;
        state.connections = snapshot.connections;
        deselectAll();
        updateEmptyState();
        showNotification('Redo', 'info');
    }
}

// Zoom & Pan
function zoom(factor) {
    state.zoom *= factor;
    state.zoom = Math.max(0.25, Math.min(state.zoom, 4));
    showNotification(`Zoom: ${Math.round(state.zoom * 100)}%`, 'info');
}

function fitToScreen() {
    if (state.modules.length === 0) return;
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const module of state.modules) {
        minX = Math.min(minX, module.x);
        minY = Math.min(minY, module.y);
        maxX = Math.max(maxX, module.x + module.width);
        maxY = Math.max(maxY, module.y + module.height);
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 50;
    
    state.zoom = Math.min(
        (canvas.width - padding * 2) / width,
        (canvas.height - padding * 2) / height
    );
    
    showNotification('Fit to screen', 'info');
}

function toggleGrid() {
    state.showGrid = !state.showGrid;
    const btn = document.getElementById('gridBtn');
    btn.classList.toggle('active', state.showGrid);
    showNotification(state.showGrid ? 'Grid enabled' : 'Grid disabled', 'info');
}

// LocalStorage Persistence
function savePatchToStorage() {
    const patchData = {
        name: document.getElementById('patchName').value,
        modules: state.modules,
        connections: state.connections
    };
    localStorage.setItem('haos_current_patch', JSON.stringify(patchData));
}

function loadPatchFromStorage() {
    const stored = localStorage.getItem('haos_current_patch');
    if (stored) {
        try {
            const patchData = JSON.parse(stored);
            if (patchData.modules && patchData.modules.length > 0) {
                loadPatchData(patchData);
            }
        } catch (e) {
            console.error('Failed to load patch from storage:', e);
        }
    }
}

// Keyboard Shortcuts
function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                undo();
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
            case 's':
                e.preventDefault();
                savePatch();
                break;
        }
    }
    
    if (e.key === 'Delete' && state.selectedModule) {
        deleteModule(state.selectedModule.id);
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#3D5A3D' : type === 'error' ? '#5A3D3D' : '#2a2a2a'};
        color: ${type === 'success' ? '#39FF14' : type === 'error' ? '#FF6B35' : '#F4E8D8'};
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid ${type === 'success' ? '#39FF14' : type === 'error' ? '#FF6B35' : '#3a3a3a'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 13px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize empty state
updateEmptyState();
