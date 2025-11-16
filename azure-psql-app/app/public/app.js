// ============================================================================
// Notes App - Frontend JavaScript
// ============================================================================

// State Management
let notes = [];
let filteredNotes = [];
let categories = new Set();
let darkMode = localStorage.getItem('darkMode') === 'true';

// API Configuration
const API_BASE = window.location.origin;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    checkHealth();
    loadNotes();
});

// ============================================================================
// Theme Management
// ============================================================================

function initializeTheme() {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').className = 'fas fa-sun text-white text-xl';
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('theme-icon');
    icon.className = darkMode ? 'fas fa-sun text-white text-xl' : 'fas fa-moon text-white text-xl';
}

// ============================================================================
// Event Listeners
// ============================================================================

function initializeEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadNotes();
        showToast('Refreshing notes...', 'info');
    });
    
    // Create note form
    document.getElementById('note-form').addEventListener('submit', handleCreateNote);
    
    // Edit form
    document.getElementById('edit-form').addEventListener('submit', handleEditNote);
    
    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
    
    // Search and filter
    document.getElementById('search-input').addEventListener('input', filterNotes);
    document.getElementById('category-filter').addEventListener('change', filterNotes);
    document.getElementById('sort-select').addEventListener('change', sortNotes);
    
    // Close modal on background click
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') closeEditModal();
    });
}

// ============================================================================
// API Calls
// ============================================================================

async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        const statusEl = document.getElementById('db-status');
        
        if (data.status === 'healthy') {
            statusEl.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Connected';
            statusEl.className = 'font-medium text-green-300';
        } else {
            statusEl.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i>Disconnected';
            statusEl.className = 'font-medium text-red-300';
        }
    } catch (error) {
        const statusEl = document.getElementById('db-status');
        statusEl.innerHTML = '<i class="fas fa-times-circle mr-1"></i>Error';
        statusEl.className = 'font-medium text-red-300';
    }
}

async function loadNotes() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) throw new Error('Failed to load notes');
        
        notes = await response.json();
        filteredNotes = [...notes];
        
        // Extract unique categories
        categories = new Set(notes.map(note => note.category).filter(Boolean));
        updateCategoryFilter();
        
        sortNotes();
        updateStats();
        renderNotes();
    } catch (error) {
        console.error('Error loading notes:', error);
        showToast('Failed to load notes', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCreateNote(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const noteType = formData.get('note_type') || 'text';
    
    const noteData = {
        title: formData.get('title').trim(),
        content: formData.get('content').trim() || 'Mermaid Diagram',
        category: formData.get('category').trim() || null,
        important: formData.get('important') === 'on',
        note_type: noteType
    };
    
    // Add diagram data if diagram type
    if (noteType === 'diagram') {
        noteData.mermaid_code = formData.get('mermaid_code') || null;
        noteData.diagram_data = diagramNodes.length > 0 ? JSON.stringify({
            nodes: diagramNodes,
            connections: diagramConnections
        }) : null;
    }
    
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        
        if (!response.ok) throw new Error('Failed to create note');
        
        showToast('Note created successfully!', 'success');
        e.target.reset();
        diagramNodes = [];
        diagramConnections = [];
        renderDiagramCanvas();
        await loadNotes();
    } catch (error) {
        console.error('Error creating note:', error);
        showToast('Failed to create note', 'error');
    }
}

async function handleEditNote(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const noteData = {
        title: document.getElementById('edit-title').value.trim(),
        content: document.getElementById('edit-content').value.trim(),
        category: document.getElementById('edit-category').value.trim() || null,
        important: document.getElementById('edit-important').checked
    };
    
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        
        if (!response.ok) throw new Error('Failed to update note');
        
        showToast('Note updated successfully!', 'success');
        closeEditModal();
        await loadNotes();
    } catch (error) {
        console.error('Error updating note:', error);
        showToast('Failed to update note', 'error');
    }
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete note');
        
        showToast('Note deleted successfully!', 'success');
        await loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Failed to delete note', 'error');
    }
}

// ============================================================================
// UI Functions
// ============================================================================

function renderNotes() {
    const container = document.getElementById('notes-container');
    const emptyState = document.getElementById('empty-state');
    
    if (filteredNotes.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    container.innerHTML = filteredNotes.map(note => `
        <div class="note-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden slide-in">
            ${note.important ? `
                <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2">
                    <span class="text-white text-sm font-semibold flex items-center">
                        <i class="fas fa-star mr-2"></i>Important
                    </span>
                </div>
            ` : ''}
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white flex-1 pr-2">
                        ${note.note_type === 'diagram' ? '📊 ' : ''}${escapeHtml(note.title)}
                    </h3>
                    <div class="flex space-x-2">
                        <button 
                            onclick="openEditModal(${note.id})" 
                            class="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit note"
                        >
                            <i class="fas fa-edit text-lg"></i>
                        </button>
                        <button 
                            onclick="deleteNote(${note.id})" 
                            class="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete note"
                        >
                            <i class="fas fa-trash text-lg"></i>
                        </button>
                    </div>
                </div>
                
                ${note.note_type === 'diagram' && note.mermaid_code ? `
                    <div class="mermaid-container mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div class="mermaid">${note.mermaid_code}</div>
                    </div>
                ` : `
                    <p class="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        ${escapeHtml(note.content)}
                    </p>
                `}
                
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                        ${note.category ? `
                            <span class="category-badge px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                <i class="fas fa-tag mr-1"></i>${escapeHtml(note.category)}
                            </span>
                        ` : ''}
                        ${note.note_type === 'diagram' ? `
                            <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                <i class="fas fa-project-diagram mr-1"></i>Diagram
                            </span>
                        ` : ''}
                    </div>
                    <div class="text-gray-400 dark:text-gray-500 flex items-center">
                        <i class="fas fa-clock mr-1"></i>
                        <span>${formatDate(note.created_at)}</span>
                    </div>
                </div>
                
                ${note.updated_at !== note.created_at ? `
                    <div class="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center">
                        <i class="fas fa-edit mr-1"></i>
                        Updated: ${formatDate(note.updated_at)}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Render Mermaid diagrams after DOM update
    setTimeout(() => {
        if (typeof mermaid !== 'undefined') {
            mermaid.run({
                nodes: document.querySelectorAll('.mermaid')
            });
        }
    }, 100);
}

function updateStats() {
    document.getElementById('total-notes').textContent = notes.length;
    
    const importantCount = notes.filter(note => note.important).length;
    document.getElementById('important-notes').textContent = importantCount;
    
    document.getElementById('category-count').textContent = categories.size;
    
    // Recent notes (created in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = notes.filter(note => new Date(note.created_at) > oneDayAgo).length;
    document.getElementById('recent-notes').textContent = recentCount;
    
    // Update filtered count
    const countEl = document.getElementById('filtered-count');
    if (filteredNotes.length !== notes.length) {
        countEl.textContent = `(showing ${filteredNotes.length} of ${notes.length})`;
    } else {
        countEl.textContent = '';
    }
}

function updateCategoryFilter() {
    const select = document.getElementById('category-filter');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Categories</option>';
    
    [...categories].sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        if (category === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

function filterNotes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    filteredNotes = notes.filter(note => {
        const matchesSearch = !searchTerm || 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm) ||
            (note.category && note.category.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !categoryFilter || note.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    sortNotes();
}

function sortNotes() {
    const sortBy = document.getElementById('sort-select').value;
    
    filteredNotes.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    
    updateStats();
    renderNotes();
}

function openEditModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    document.getElementById('edit-id').value = note.id;
    document.getElementById('edit-title').value = note.title;
    document.getElementById('edit-content').value = note.content;
    document.getElementById('edit-category').value = note.category || '';
    document.getElementById('edit-important').checked = note.important;
    
    document.getElementById('edit-modal').classList.remove('hidden');
    document.getElementById('edit-modal').classList.add('flex');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('flex');
    document.getElementById('edit-form').reset();
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('notes-container');
    
    if (show) {
        loading.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        container.classList.remove('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.className = `toast ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} text-xl"></i>
        <span class="flex-1">${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================================================================
// Utility Functions
// ============================================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================================================
// Mermaid Diagram Editor
// ============================================================================

let diagramNodes = [];
let diagramConnections = [];
let selectedNode = null;
let draggedNode = null;
let dragOffset = { x: 0, y: 0 };

// Initialize Mermaid
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ 
        startOnLoad: false,
        theme: darkMode ? 'dark' : 'default',
        securityLevel: 'loose'
    });
}

// Toggle between text and diagram mode
document.addEventListener('DOMContentLoaded', () => {
    const noteTypeSelect = document.getElementById('note-type');
    const textSection = document.getElementById('text-content-section');
    const diagramSection = document.getElementById('diagram-content-section');
    const contentField = document.getElementById('content');
    const mermaidCodeField = document.getElementById('mermaid-code');
    
    if (noteTypeSelect) {
        noteTypeSelect.addEventListener('change', (e) => {
            const isDiagram = e.target.value === 'diagram';
            textSection.classList.toggle('hidden', isDiagram);
            diagramSection.classList.toggle('hidden', !isDiagram);
            
            // Update content requirement
            if (isDiagram) {
                contentField.removeAttribute('required');
                contentField.value = 'Mermaid Diagram';
            } else {
                contentField.setAttribute('required', 'required');
                contentField.value = '';
            }
        });
    }
    
    // Live preview of Mermaid code
    if (mermaidCodeField) {
        mermaidCodeField.addEventListener('input', debounce(updateMermaidPreview, 500));
    }
    
    // Initialize diagram canvas interactions
    initializeDiagramCanvas();
});

function initializeDiagramCanvas() {
    const canvas = document.getElementById('diagram-canvas');
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', onCanvasMouseUp);
}

function addDiagramNode(shape, label) {
    const canvas = document.getElementById('diagram-canvas');
    const rect = canvas.getBoundingClientRect();
    
    const node = {
        id: `node_${Date.now()}`,
        label: label || 'New Node',
        shape: shape,
        x: Math.random() * (rect.width - 100) + 50,
        y: Math.random() * (rect.height - 60) + 30
    };
    
    diagramNodes.push(node);
    renderDiagramCanvas();
    updateMermaidCode();
}

function clearDiagram() {
    if (confirm('Are you sure you want to clear the diagram?')) {
        diagramNodes = [];
        diagramConnections = [];
        renderDiagramCanvas();
        updateMermaidCode();
    }
}

function renderDiagramCanvas() {
    const canvas = document.getElementById('diagram-canvas');
    if (!canvas) return;
    
    // Clear existing nodes
    const existingNodes = canvas.querySelectorAll('.diagram-node');
    existingNodes.forEach(node => node.remove());
    
    // Render nodes
    diagramNodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'diagram-node';
        nodeEl.setAttribute('data-node-id', node.id);
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        nodeEl.style.cursor = 'move';
        
        // Add shape-specific styling
        if (node.shape === 'round') {
            nodeEl.style.borderRadius = '50px';
        } else if (node.shape === 'diamond') {
            nodeEl.style.transform = 'rotate(45deg)';
            nodeEl.innerHTML = `<span style="transform: rotate(-45deg); display: block;">${node.label}</span>`;
        } else {
            nodeEl.textContent = node.label;
        }
        
        if (node.shape !== 'diamond') {
            nodeEl.textContent = node.label;
        }
        
        // Double-click to edit label
        nodeEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const newLabel = prompt('Enter new label:', node.label);
            if (newLabel) {
                node.label = newLabel;
                renderDiagramCanvas();
                updateMermaidCode();
            }
        });
        
        // Right-click to delete
        nodeEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Delete node "${node.label}"?`)) {
                diagramNodes = diagramNodes.filter(n => n.id !== node.id);
                renderDiagramCanvas();
                updateMermaidCode();
            }
        });
        
        canvas.appendChild(nodeEl);
    });
}

// HTML5 Drag and Drop Implementation (removed - using mouse events instead)
// Mouse-based drag is more reliable and works better with visual feedback

function onCanvasMouseDown(e) {
    // Handle node dragging with mouse events (more reliable than HTML5 drag)
    const nodeEl = e.target.closest('.diagram-node');
    if (nodeEl) {
        const nodeId = nodeEl.getAttribute('data-node-id');
        draggedNode = diagramNodes.find(n => n.id === nodeId);
        if (draggedNode) {
            const rect = nodeEl.getBoundingClientRect();
            const canvas = document.getElementById('diagram-canvas');
            const canvasRect = canvas.getBoundingClientRect();
            
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            // Add visual feedback
            nodeEl.classList.add('dragging');
            selectedNode = draggedNode;
        }
    }
}

function onCanvasMouseMove(e) {
    // Enhanced for real-time dragging
    if (draggedNode && e.buttons === 1) {
        const canvas = document.getElementById('diagram-canvas');
        const rect = canvas.getBoundingClientRect();
        
        // Calculate new position
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        // Constrain within canvas bounds
        draggedNode.x = Math.max(0, Math.min(newX, rect.width - 100));
        draggedNode.y = Math.max(0, Math.min(newY, rect.height - 40));
        
        // Update position in real-time
        const nodeEl = document.querySelector(`[data-node-id="${draggedNode.id}"]`);
        if (nodeEl) {
            nodeEl.style.left = `${draggedNode.x}px`;
            nodeEl.style.top = `${draggedNode.y}px`;
        }
    }
}

function onCanvasMouseUp() {
    if (draggedNode) {
        // Remove visual feedback
        const nodeEl = document.querySelector(`[data-node-id="${draggedNode.id}"]`);
        if (nodeEl) {
            nodeEl.classList.remove('dragging');
        }
        draggedNode = null;
        updateMermaidCode();
    }
}

function updateMermaidCode() {
    const mermaidCodeField = document.getElementById('mermaid-code');
    if (!mermaidCodeField) return;
    
    // Generate Mermaid code from visual nodes
    let code = 'graph TD\n';
    diagramNodes.forEach((node, idx) => {
        const nodeId = `N${idx + 1}`;
        let nodeCode = '';
        
        if (node.shape === 'round') {
            nodeCode = `    ${nodeId}((${node.label}))\n`;
        } else if (node.shape === 'diamond') {
            nodeCode = `    ${nodeId}{${node.label}}\n`;
        } else {
            nodeCode = `    ${nodeId}[${node.label}]\n`;
        }
        
        code += nodeCode;
    });
    
    // Add sample connections if nodes exist
    if (diagramNodes.length > 1) {
        code += `    N1 --> N2\n`;
    }
    
    mermaidCodeField.value = code;
    updateMermaidPreview();
}

function updateMermaidPreview() {
    const mermaidCode = document.getElementById('mermaid-code')?.value;
    const preview = document.getElementById('mermaid-preview');
    
    if (!mermaidCode || !preview || typeof mermaid === 'undefined') return;
    
    // Clear previous content
    preview.innerHTML = `<div class="mermaid">${mermaidCode}</div>`;
    
    // Render mermaid
    try {
        mermaid.run({
            nodes: preview.querySelectorAll('.mermaid')
        });
    } catch (error) {
        preview.innerHTML = `<p class="text-red-500">Error rendering diagram: ${error.message}</p>`;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
