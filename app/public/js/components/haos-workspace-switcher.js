/**
 * HAOS Workspace Switcher Component
 * Modal for quick switching between workspaces
 * 
 * Usage:
 * window.HAOSWorkspaceSwitcher.show();
 * 
 * Keyboard shortcut: Ctrl/Cmd + K
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

class HAOSWorkspaceSwitcher {
  constructor() {
    this.workspaces = [
      {
        id: 'techno',
        name: 'TECHNO WORKSPACE',
        icon: '🎛️',
        description: 'Live modular synthesis with TB-303, TR-909, and 16-step sequencer',
        path: '/techno-workspace.html',
        color: '#FF6B35',
        features: ['TB-303 Acid Bass', 'TR-909 Drums', '16-Step Sequencer', 'Modular Routing']
      },
      {
        id: 'modular',
        name: 'MODULAR WORKSPACE',
        icon: '🎹',
        description: 'ARP 2600, Guitar, Violin, and Strings instruments in one interface',
        path: '/modular-workspace.html',
        color: '#00D9FF',
        features: ['ARP 2600 Synth', 'Virtual Guitar', 'Virtual Violin', 'Strings Ensemble']
      },
      {
        id: 'builder',
        name: 'BUILDER',
        icon: '🔧',
        description: 'Create preset variations with frequency-based sound design',
        path: '/builder.html',
        color: '#39FF14',
        features: ['KICK', 'SUB', 'LEAD', 'SYNTH', 'FX', 'PERCUSSION', 'HAT', 'RIDE']
      },
      {
        id: 'sounds',
        name: 'SOUNDS',
        icon: '🎵',
        description: 'Browse and preview 1000+ presets with advanced filtering',
        path: '/sounds.html',
        color: '#FF006E',
        features: ['1000+ Presets', 'Favorites', 'Categories', 'Audio Preview']
      }
    ];
    
    this.modal = null;
    this.isVisible = false;
    this.selectedIndex = 0;
    this.recentWorkspaces = this.loadRecentWorkspaces();
    
    this.init();
  }

  init() {
    // Create modal element
    this.createModal();
    
    // Global keyboard shortcut
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      
      // Escape to close
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
      
      // Arrow navigation when visible
      if (this.isVisible) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectNext();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectPrevious();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.launchSelected();
        }
      }
    });

    // Listen for custom event from navigation
    document.addEventListener('open-workspace-switcher', () => {
      this.show();
    });
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'haos-ws-switcher';
    this.modal.innerHTML = this.getModalHTML();
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(this.modal);
    
    // Attach events
    this.attachEvents();
  }

  getStyles() {
    return `
      .haos-ws-switcher {
        --haos-black: #0a0a0a;
        --haos-panel: rgba(20, 20, 25, 0.98);
        --haos-orange: #FF6B35;
        --haos-orange-bright: #FF8C42;
        --haos-green: #39FF14;
        --haos-cyan: #00D9FF;
        --haos-pink: #FF006E;
        --haos-text: #e0e0e0;
        --haos-dim: #888;
        --haos-border: rgba(255, 107, 53, 0.2);
        
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.25s ease, visibility 0.25s ease;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .haos-ws-switcher--visible {
        opacity: 1;
        visibility: visible;
      }

      .haos-ws-switcher__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .haos-ws-switcher__content {
        position: relative;
        background: var(--haos-panel);
        border-radius: 20px;
        padding: 2rem 2.5rem;
        max-width: 800px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        border: 2px solid var(--haos-border);
        box-shadow: 
          0 25px 80px rgba(0, 0, 0, 0.6),
          0 0 60px rgba(255, 107, 53, 0.15);
        transform: scale(0.95) translateY(20px);
        transition: transform 0.25s ease;
      }

      .haos-ws-switcher--visible .haos-ws-switcher__content {
        transform: scale(1) translateY(0);
      }

      .haos-ws-switcher__close {
        position: absolute;
        top: 1.25rem;
        right: 1.25rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--haos-dim);
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .haos-ws-switcher__close:hover {
        color: var(--haos-orange);
        border-color: var(--haos-orange);
        background: rgba(255, 107, 53, 0.1);
      }

      .haos-ws-switcher__header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .haos-ws-switcher__title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 2.2rem;
        letter-spacing: 3px;
        background: linear-gradient(135deg, var(--haos-orange), var(--haos-orange-bright));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0 0 0.5rem 0;
      }

      .haos-ws-switcher__subtitle {
        font-family: 'Space Mono', monospace;
        font-size: 0.85rem;
        color: var(--haos-dim);
      }

      .haos-ws-switcher__recent {
        margin-bottom: 1.5rem;
      }

      .haos-ws-switcher__recent-title {
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        color: var(--haos-dim);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.75rem;
      }

      .haos-ws-switcher__recent-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .haos-ws-switcher__chip {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 0.4rem 0.9rem;
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        color: var(--haos-text);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .haos-ws-switcher__chip:hover {
        background: rgba(255, 107, 53, 0.15);
        border-color: var(--haos-orange);
        color: var(--haos-orange);
      }

      .haos-ws-switcher__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 600px) {
        .haos-ws-switcher__grid {
          grid-template-columns: 1fr;
        }
      }

      .haos-ws-switcher__card {
        position: relative;
        background: rgba(255, 255, 255, 0.03);
        border: 2px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.25s ease;
        overflow: hidden;
      }

      .haos-ws-switcher__card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--ws-color);
        opacity: 0;
        transition: opacity 0.25s ease;
      }

      .haos-ws-switcher__card:hover,
      .haos-ws-switcher__card--selected {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--ws-color);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .haos-ws-switcher__card:hover::before,
      .haos-ws-switcher__card--selected::before {
        opacity: 1;
      }

      .haos-ws-switcher__card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .haos-ws-switcher__card-icon {
        font-size: 2rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }

      .haos-ws-switcher__card-name {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.3rem;
        letter-spacing: 1px;
        color: var(--ws-color);
      }

      .haos-ws-switcher__card-desc {
        font-size: 0.8rem;
        color: var(--haos-dim);
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      .haos-ws-switcher__card-features {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .haos-ws-switcher__feature {
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        color: var(--haos-dim);
      }

      .haos-ws-switcher__card-launch {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background: var(--ws-color);
        border: none;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .haos-ws-switcher__card:hover .haos-ws-switcher__card-launch,
      .haos-ws-switcher__card--selected .haos-ws-switcher__card-launch {
        opacity: 1;
        transform: translateY(0);
      }

      .haos-ws-switcher__card-launch:hover {
        filter: brightness(1.2);
      }

      .haos-ws-switcher__footer {
        text-align: center;
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        color: var(--haos-dim);
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .haos-ws-switcher__footer kbd {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        padding: 0.2rem 0.5rem;
        font-family: inherit;
        font-size: 0.65rem;
        margin: 0 0.15rem;
      }

      /* Loading state */
      .haos-ws-switcher__loading {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
      }

      .haos-ws-switcher--loading .haos-ws-switcher__main {
        display: none;
      }

      .haos-ws-switcher--loading .haos-ws-switcher__loading {
        display: flex;
      }

      .haos-ws-switcher__spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--haos-orange);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .haos-ws-switcher__loading-text {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.5rem;
        letter-spacing: 2px;
        color: var(--haos-text);
        margin-bottom: 0.5rem;
      }

      .haos-ws-switcher__loading-desc {
        font-size: 0.85rem;
        color: var(--haos-dim);
      }
    `;
  }

  getModalHTML() {
    return `
      <div class="haos-ws-switcher__overlay"></div>
      <div class="haos-ws-switcher__content">
        <button class="haos-ws-switcher__close" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>

        <div class="haos-ws-switcher__main">
          <div class="haos-ws-switcher__header">
            <h2 class="haos-ws-switcher__title">SWITCH WORKSPACE</h2>
            <p class="haos-ws-switcher__subtitle">Choose your creative environment</p>
          </div>

          ${this.recentWorkspaces.length > 0 ? `
            <div class="haos-ws-switcher__recent">
              <div class="haos-ws-switcher__recent-title">Recent</div>
              <div class="haos-ws-switcher__recent-chips">
                ${this.recentWorkspaces.map(id => {
                  const ws = this.workspaces.find(w => w.id === id);
                  if (!ws) return '';
                  return `
                    <button class="haos-ws-switcher__chip" data-workspace="${ws.id}">
                      <span>${ws.icon}</span>
                      ${ws.name}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <div class="haos-ws-switcher__grid">
            ${this.workspaces.map((ws, index) => `
              <div class="haos-ws-switcher__card ${index === this.selectedIndex ? 'haos-ws-switcher__card--selected' : ''}" 
                   data-workspace="${ws.id}" 
                   data-index="${index}"
                   style="--ws-color: ${ws.color}">
                <div class="haos-ws-switcher__card-header">
                  <span class="haos-ws-switcher__card-icon">${ws.icon}</span>
                  <span class="haos-ws-switcher__card-name">${ws.name}</span>
                </div>
                <p class="haos-ws-switcher__card-desc">${ws.description}</p>
                <div class="haos-ws-switcher__card-features">
                  ${ws.features.slice(0, 4).map(f => `
                    <span class="haos-ws-switcher__feature">${f}</span>
                  `).join('')}
                </div>
                <button class="haos-ws-switcher__card-launch" data-workspace="${ws.id}">
                  LAUNCH <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            `).join('')}
          </div>

          <div class="haos-ws-switcher__footer">
            <kbd>↑</kbd><kbd>↓</kbd> Navigate
            <kbd>Enter</kbd> Launch
            <kbd>Esc</kbd> Close
            <kbd>⌘</kbd><kbd>K</kbd> Toggle
          </div>
        </div>

        <div class="haos-ws-switcher__loading">
          <div class="haos-ws-switcher__spinner"></div>
          <div class="haos-ws-switcher__loading-text">Loading Workspace...</div>
          <div class="haos-ws-switcher__loading-desc"></div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Close button
    const closeBtn = this.modal.querySelector('.haos-ws-switcher__close');
    closeBtn.addEventListener('click', () => this.hide());

    // Overlay click
    const overlay = this.modal.querySelector('.haos-ws-switcher__overlay');
    overlay.addEventListener('click', () => this.hide());

    // Workspace cards
    const cards = this.modal.querySelectorAll('.haos-ws-switcher__card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const workspaceId = card.dataset.workspace;
        this.launchWorkspace(workspaceId);
      });

      card.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(card.dataset.index);
        this.updateSelection();
      });
    });

    // Recent chips
    const chips = this.modal.querySelectorAll('.haos-ws-switcher__chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const workspaceId = chip.dataset.workspace;
        this.launchWorkspace(workspaceId);
      });
    });

    // Launch buttons
    const launchBtns = this.modal.querySelectorAll('.haos-ws-switcher__card-launch');
    launchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const workspaceId = btn.dataset.workspace;
        this.launchWorkspace(workspaceId);
      });
    });
  }

  show() {
    this.isVisible = true;
    this.modal.classList.add('haos-ws-switcher--visible');
    document.body.style.overflow = 'hidden';
    this.selectedIndex = 0;
    this.updateSelection();
  }

  hide() {
    this.isVisible = false;
    this.modal.classList.remove('haos-ws-switcher--visible');
    this.modal.classList.remove('haos-ws-switcher--loading');
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  selectNext() {
    this.selectedIndex = (this.selectedIndex + 1) % this.workspaces.length;
    this.updateSelection();
  }

  selectPrevious() {
    this.selectedIndex = (this.selectedIndex - 1 + this.workspaces.length) % this.workspaces.length;
    this.updateSelection();
  }

  updateSelection() {
    const cards = this.modal.querySelectorAll('.haos-ws-switcher__card');
    cards.forEach((card, index) => {
      card.classList.toggle('haos-ws-switcher__card--selected', index === this.selectedIndex);
    });
  }

  launchSelected() {
    const workspace = this.workspaces[this.selectedIndex];
    if (workspace) {
      this.launchWorkspace(workspace.id);
    }
  }

  launchWorkspace(workspaceId) {
    const workspace = this.workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    // Add to recent
    this.addToRecent(workspaceId);

    // Show loading state
    this.modal.classList.add('haos-ws-switcher--loading');
    const loadingText = this.modal.querySelector('.haos-ws-switcher__loading-text');
    const loadingDesc = this.modal.querySelector('.haos-ws-switcher__loading-desc');
    loadingText.textContent = `Loading ${workspace.name}...`;
    loadingDesc.textContent = workspace.description;

    // Navigate after animation
    setTimeout(() => {
      window.location.href = workspace.path;
    }, 400);
  }

  addToRecent(workspaceId) {
    this.recentWorkspaces = this.recentWorkspaces.filter(id => id !== workspaceId);
    this.recentWorkspaces.unshift(workspaceId);
    this.recentWorkspaces = this.recentWorkspaces.slice(0, 3);
    localStorage.setItem('haos_recent_workspaces', JSON.stringify(this.recentWorkspaces));
  }

  loadRecentWorkspaces() {
    try {
      return JSON.parse(localStorage.getItem('haos_recent_workspaces') || '[]');
    } catch {
      return [];
    }
  }
}

// Initialize globally
window.HAOSWorkspaceSwitcher = new HAOSWorkspaceSwitcher();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSWorkspaceSwitcher;
}
