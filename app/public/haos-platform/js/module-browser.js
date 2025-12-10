// Module Browser Logic - HAOS Platform
// Manages module discovery, installation, and filtering

// Module database with metadata
const MODULE_DATABASE = [
    {
        id: 'waveshaper',
        name: 'Waveshaper',
        category: 'effect',
        description: 'Distortion and waveshaping effect with 6 curve types',
        icon: '🎚️',
        tier: 'free',
        cpu: 'light',
        presets: 6,
        inputs: ['Audio'],
        outputs: ['Audio'],
        parameters: ['drive', 'output', 'curve', 'mix'],
        tags: ['distortion', 'saturation', 'waveshaping', 'harmonics'],
        path: '/haos-platform/js/modules/effects/waveshaper.js'
    },
    {
        id: 'phaser',
        name: 'Phaser',
        category: 'effect',
        description: 'Classic phase shifting effect with all-pass filter cascade',
        icon: '🌊',
        tier: 'free',
        cpu: 'medium',
        presets: 6,
        inputs: ['Audio'],
        outputs: ['Audio'],
        parameters: ['rate', 'depth', 'feedback', 'stages', 'frequency', 'mix'],
        tags: ['phaser', 'modulation', 'sweep', 'vintage'],
        path: '/haos-platform/js/modules/effects/phaser.js'
    },
    {
        id: 'delay',
        name: 'Stereo Delay',
        category: 'effect',
        description: 'Stereo/ping-pong delay with tempo sync and tone control',
        icon: '🔁',
        tier: 'free',
        cpu: 'medium',
        presets: 6,
        inputs: ['Audio L', 'Audio R'],
        outputs: ['Audio L', 'Audio R'],
        parameters: ['time', 'feedback', 'mix', 'filter', 'stereo_mode', 'sync', 'bpm'],
        tags: ['delay', 'echo', 'stereo', 'ping-pong', 'tempo'],
        path: '/haos-platform/js/modules/effects/delay.js'
    },
    {
        id: 'reverb',
        name: 'Algorithmic Reverb',
        category: 'effect',
        description: 'High-quality reverb using Freeverb topology',
        icon: '🏛️',
        tier: 'premium',
        cpu: 'heavy',
        presets: 8,
        inputs: ['Audio L', 'Audio R'],
        outputs: ['Audio L', 'Audio R'],
        parameters: ['size', 'damping', 'mix', 'predelay', 'width', 'diffusion', 'decay'],
        tags: ['reverb', 'space', 'room', 'hall', 'freeverb'],
        path: '/haos-platform/js/modules/effects/reverb.js'
    },
    // Placeholder modules (to be implemented)
    {
        id: 'vco',
        name: 'Voltage Controlled Oscillator',
        category: 'oscillator',
        description: 'Classic analog-style oscillator with multiple waveforms',
        icon: '🎵',
        tier: 'free',
        cpu: 'light',
        presets: 12,
        inputs: ['V/Oct', 'PWM', 'FM'],
        outputs: ['Audio', 'Saw', 'Square', 'Triangle', 'Sine'],
        parameters: ['frequency', 'detune', 'pwm', 'fm_amount', 'octave'],
        tags: ['oscillator', 'vco', 'analog', 'waveform'],
        path: null, // Not yet implemented
        available: false
    },
    {
        id: 'vcf',
        name: 'Voltage Controlled Filter',
        category: 'filter',
        description: 'Classic 4-pole resonant filter with multiple modes',
        icon: '🎛️',
        tier: 'free',
        cpu: 'medium',
        presets: 10,
        inputs: ['Audio', 'CV', 'Resonance CV'],
        outputs: ['Audio', 'LP', 'BP', 'HP'],
        parameters: ['cutoff', 'resonance', 'mode', 'drive', 'envelope'],
        tags: ['filter', 'vcf', 'resonance', 'lowpass', 'highpass'],
        path: null,
        available: false
    },
    {
        id: 'lfo',
        name: 'Low Frequency Oscillator',
        category: 'modulator',
        description: 'Versatile LFO with multiple waveforms and sync options',
        icon: '〰️',
        tier: 'free',
        cpu: 'light',
        presets: 8,
        inputs: ['Reset', 'Rate CV'],
        outputs: ['CV Out', 'Inverted', 'Bipolar', 'Unipolar'],
        parameters: ['rate', 'waveform', 'phase', 'amplitude', 'sync'],
        tags: ['lfo', 'modulation', 'oscillator', 'cv'],
        path: null,
        available: false
    },
    {
        id: 'adsr',
        name: 'ADSR Envelope',
        category: 'modulator',
        description: 'Classic envelope generator with Attack-Decay-Sustain-Release',
        icon: '📈',
        tier: 'free',
        cpu: 'light',
        presets: 12,
        inputs: ['Gate', 'Velocity'],
        outputs: ['CV Out', 'Gate Out'],
        parameters: ['attack', 'decay', 'sustain', 'release', 'curve'],
        tags: ['envelope', 'adsr', 'modulation', 'dynamics'],
        path: null,
        available: false
    },
    {
        id: 'step-seq',
        name: 'Step Sequencer',
        category: 'sequencer',
        description: '16-step sequencer with CV and gate outputs',
        icon: '🎹',
        tier: 'premium',
        cpu: 'medium',
        presets: 10,
        inputs: ['Clock', 'Reset'],
        outputs: ['CV Out', 'Gate Out', 'Trigger'],
        parameters: ['steps', 'clock_div', 'swing', 'gate_length'],
        tags: ['sequencer', 'step', 'pattern', 'cv', 'gate'],
        path: null,
        available: false
    },
    {
        id: 'mixer',
        name: '4-Channel Mixer',
        category: 'utility',
        description: 'Stereo mixer with 4 channels, pan, and aux sends',
        icon: '🎚️',
        tier: 'free',
        cpu: 'light',
        presets: 4,
        inputs: ['Ch1', 'Ch2', 'Ch3', 'Ch4', 'Aux Return'],
        outputs: ['Main L', 'Main R', 'Aux Send'],
        parameters: ['level', 'pan', 'aux_send', 'mute', 'solo'],
        tags: ['mixer', 'utility', 'levels', 'pan'],
        path: null,
        available: false
    },
    {
        id: 'scope',
        name: 'Oscilloscope',
        category: 'utility',
        description: 'Visual waveform display with dual channels',
        icon: '📊',
        tier: 'free',
        cpu: 'medium',
        presets: 3,
        inputs: ['Audio L', 'Audio R', 'Trigger'],
        outputs: [],
        parameters: ['timebase', 'trigger_level', 'mode', 'freeze'],
        tags: ['scope', 'oscilloscope', 'visual', 'analyzer'],
        path: null,
        available: false
    }
];

// State management
let installedModules = [];
let currentCategory = 'all';
let currentFilters = {
    search: '',
    tier: 'all',
    cpu: 'all',
    sort: 'name'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadInstalledModules();
    renderModules();
});

// Load installed modules from localStorage
function loadInstalledModules() {
    const stored = localStorage.getItem('haos_installed_modules');
    installedModules = stored ? JSON.parse(stored) : ['waveshaper', 'phaser', 'delay', 'reverb'];
    saveInstalledModules();
}

// Save installed modules to localStorage
function saveInstalledModules() {
    localStorage.setItem('haos_installed_modules', JSON.stringify(installedModules));
}

// Install module
function installModule(moduleId) {
    if (!installedModules.includes(moduleId)) {
        installedModules.push(moduleId);
        saveInstalledModules();
        renderModules();
        
        // Show success notification
        showNotification(`Module "${getModuleById(moduleId).name}" installed successfully!`, 'success');
    }
}

// Uninstall module
function uninstallModule(moduleId) {
    installedModules = installedModules.filter(id => id !== moduleId);
    saveInstalledModules();
    renderModules();
    
    // Show notification
    showNotification(`Module "${getModuleById(moduleId).name}" uninstalled`, 'info');
}

// Get module by ID
function getModuleById(id) {
    return MODULE_DATABASE.find(m => m.id === id);
}

// Check if module is installed
function isModuleInstalled(moduleId) {
    return installedModules.includes(moduleId);
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    renderModules();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('tierFilter').value = 'all';
    document.getElementById('cpuFilter').value = 'all';
    document.getElementById('sortBy').value = 'name';
    
    currentFilters = {
        search: '',
        tier: 'all',
        cpu: 'all',
        sort: 'name'
    };
    
    selectCategory('all');
}

// Filter modules
function filterModules() {
    currentFilters = {
        search: document.getElementById('searchInput').value.toLowerCase(),
        tier: document.getElementById('tierFilter').value,
        cpu: document.getElementById('cpuFilter').value,
        sort: document.getElementById('sortBy').value
    };
    
    renderModules();
}

// Get filtered modules
function getFilteredModules() {
    let modules = MODULE_DATABASE.filter(module => {
        // Category filter
        if (currentCategory !== 'all' && module.category !== currentCategory) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchText = currentFilters.search;
            const matchName = module.name.toLowerCase().includes(searchText);
            const matchDesc = module.description.toLowerCase().includes(searchText);
            const matchTags = module.tags.some(tag => tag.includes(searchText));
            
            if (!matchName && !matchDesc && !matchTags) {
                return false;
            }
        }
        
        // Tier filter
        if (currentFilters.tier !== 'all' && module.tier !== currentFilters.tier) {
            return false;
        }
        
        // CPU filter
        if (currentFilters.cpu !== 'all' && module.cpu !== currentFilters.cpu) {
            return false;
        }
        
        return true;
    });
    
    // Sort modules
    modules.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'cpu':
                const cpuOrder = { light: 0, medium: 1, heavy: 2 };
                return cpuOrder[a.cpu] - cpuOrder[b.cpu];
            case 'cpu-desc':
                const cpuOrderDesc = { heavy: 0, medium: 1, light: 2 };
                return cpuOrderDesc[a.cpu] - cpuOrderDesc[b.cpu];
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
    
    return modules;
}

// Render modules
function renderModules() {
    const modules = getFilteredModules();
    
    // Separate installed and available
    const installed = modules.filter(m => isModuleInstalled(m.id));
    const available = modules.filter(m => !isModuleInstalled(m.id) && m.available !== false);
    
    // Render My Modules
    const myModulesGrid = document.getElementById('myModulesGrid');
    if (installed.length === 0) {
        myModulesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No Modules Installed</h3>
                <p>Browse available modules below to get started</p>
            </div>
        `;
    } else {
        myModulesGrid.innerHTML = installed.map(module => createModuleCard(module, true)).join('');
    }
    
    // Render Available Modules
    const moduleGrid = document.getElementById('moduleGrid');
    if (available.length === 0) {
        moduleGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Modules Found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
    } else {
        moduleGrid.innerHTML = available.map(module => createModuleCard(module, false)).join('');
    }
    
    // Update counts
    document.getElementById('installedCount').textContent = installed.length;
    document.getElementById('availableCount').textContent = available.length;
}

// Create module card HTML
function createModuleCard(module, isInstalled) {
    const available = module.available !== false;
    
    return `
        <div class="module-card ${isInstalled ? 'installed' : ''}" onclick="${available ? `showModuleDetails('${module.id}')` : ''}">
            <div class="module-header">
                <div class="module-icon ${module.category}">
                    ${module.icon}
                </div>
                <div class="module-info">
                    <div class="module-name">${module.name}</div>
                    <div class="module-category">${module.category}</div>
                </div>
            </div>
            
            <div class="module-description">${module.description}</div>
            
            <div class="module-stats">
                <span class="badge ${module.tier}">${module.tier}</span>
                <span class="badge ${module.cpu}">${module.cpu} CPU</span>
                <span class="stat">
                    <i class="fas fa-sliders-h"></i>
                    ${module.presets} presets
                </span>
            </div>
            
            <div class="module-stats">
                <span class="stat">
                    <i class="fas fa-arrow-down"></i>
                    ${module.inputs.length} inputs
                </span>
                <span class="stat">
                    <i class="fas fa-arrow-up"></i>
                    ${module.outputs.length} outputs
                </span>
                <span class="stat">
                    <i class="fas fa-cog"></i>
                    ${module.parameters.length} params
                </span>
            </div>
            
            ${available ? `
                <div class="module-actions" onclick="event.stopPropagation()">
                    ${isInstalled ? `
                        <button class="module-btn uninstall" onclick="uninstallModule('${module.id}')">
                            <i class="fas fa-trash"></i> Uninstall
                        </button>
                    ` : `
                        <button class="module-btn install" onclick="installModule('${module.id}')">
                            <i class="fas fa-plus"></i> Install
                        </button>
                    `}
                    <button class="module-btn preview" onclick="previewModule('${module.id}')">
                        <i class="fas fa-play"></i> Preview
                    </button>
                </div>
            ` : `
                <div class="module-actions">
                    <button class="module-btn" style="background: #2a2a2a; color: #6B6B6B; cursor: not-allowed;" disabled>
                        <i class="fas fa-lock"></i> Coming Soon
                    </button>
                </div>
            `}
        </div>
    `;
}

// Show module details (will open modal in future)
function showModuleDetails(moduleId) {
    const module = getModuleById(moduleId);
    console.log('Show details for:', module);
    // TODO: Implement modal with full module details
}

// Preview module (will play audio sample in future)
function previewModule(moduleId) {
    const module = getModuleById(moduleId);
    console.log('Preview module:', module);
    showNotification(`Preview for "${module.name}" coming soon!`, 'info');
    // TODO: Implement audio preview system
}

// Refresh modules
function refreshModules() {
    showNotification('Refreshing module database...', 'info');
    renderModules();
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#3D5A3D' : type === 'error' ? '#5A3D3D' : '#2a2a2a'};
        color: ${type === 'success' ? '#39FF14' : type === 'error' ? '#FF6B35' : '#F4E8D8'};
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid ${type === 'success' ? '#39FF14' : type === 'error' ? '#FF6B35' : '#3a3a3a'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
