/**
 * HAOS Preset Manager Component
 * Handles preset loading, saving, favorites, and browsing
 * 
 * Usage:
 * <haos-preset-manager
 *   workspace="techno"
 *   category="bass"
 *   compact="false">
 * </haos-preset-manager>
 * 
 * Events:
 * - 'preset-load' - fired when preset is loaded, detail: { preset }
 * - 'preset-save' - fired when preset is saved, detail: { preset, name }
 * - 'preset-delete' - fired when preset is deleted, detail: { presetId }
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

class HAOSPresetManager extends HTMLElement {
  static get observedAttributes() {
    return ['workspace', 'category', 'compact', 'show-favorites'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // State
    this._workspace = 'techno';
    this._category = 'all';
    this._compact = false;
    this._showFavorites = true;
    
    this._presets = [];
    this._favorites = this.loadFavorites();
    this._currentPreset = null;
    this._searchQuery = '';
    this._isLoading = false;
    
    // Categories by workspace
    this._categories = {
      techno: ['all', 'bass', 'lead', 'pad', 'drums', 'fx', 'arp', 'acid'],
      modular: ['all', 'arp2600', 'guitar', 'violin', 'strings', 'brass', 'woodwind'],
      builder: ['all', 'kick', 'sub', 'lead', 'synth', 'fx', 'percussion', 'hat', 'ride'],
      sounds: ['all', 'bass', 'lead', 'pad', 'pluck', 'keys', 'brass', 'strings', 'drums', 'fx', 'vocal']
    };
    
    this.render();
    this.attachEvents();
  }

  connectedCallback() {
    this.loadPresets();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'workspace':
        this._workspace = newValue || 'techno';
        this.loadPresets();
        break;
      case 'category':
        this._category = newValue || 'all';
        this.filterPresets();
        break;
      case 'compact':
        this._compact = newValue === 'true';
        this.updateLayout();
        break;
      case 'show-favorites':
        this._showFavorites = newValue !== 'false';
        this.updateLayout();
        break;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="preset-manager ${this._compact ? 'preset-manager--compact' : ''}">
        <!-- Header -->
        <div class="pm-header">
          <div class="pm-title">
            <span class="pm-icon">🎵</span>
            <span>PRESETS</span>
          </div>
          <div class="pm-actions">
            <button class="pm-btn pm-btn--save" title="Save Current">
              <i class="fas fa-save"></i>
            </button>
            <button class="pm-btn pm-btn--random" title="Random Preset">
              <i class="fas fa-random"></i>
            </button>
            <button class="pm-btn pm-btn--refresh" title="Refresh">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="pm-search">
          <i class="fas fa-search pm-search-icon"></i>
          <input type="text" class="pm-search-input" placeholder="Search presets...">
          <button class="pm-search-clear" title="Clear search">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Categories -->
        <div class="pm-categories">
          ${this.renderCategories()}
        </div>

        <!-- Favorites Section -->
        ${this._showFavorites ? `
          <div class="pm-favorites ${this._favorites.length === 0 ? 'pm-favorites--empty' : ''}">
            <div class="pm-section-title">
              <span>★ FAVORITES</span>
              <span class="pm-count">${this._favorites.length}</span>
            </div>
            <div class="pm-favorites-list">
              ${this.renderFavorites()}
            </div>
          </div>
        ` : ''}

        <!-- Preset List -->
        <div class="pm-list">
          <div class="pm-section-title">
            <span>ALL PRESETS</span>
            <span class="pm-count">${this._presets.length}</span>
          </div>
          <div class="pm-list-content">
            ${this.renderPresets()}
          </div>
        </div>

        <!-- Current Preset Display -->
        <div class="pm-current">
          <div class="pm-current-label">CURRENT</div>
          <div class="pm-current-name">${this._currentPreset?.name || 'No preset loaded'}</div>
          <div class="pm-current-actions">
            <button class="pm-current-btn pm-current-btn--fav ${this._currentPreset && this.isFavorite(this._currentPreset.id) ? 'active' : ''}" title="Toggle Favorite">
              <i class="fas fa-star"></i>
            </button>
            <button class="pm-current-btn pm-current-btn--copy" title="Copy Preset">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div class="pm-loading">
          <div class="pm-spinner"></div>
          <span>Loading...</span>
        </div>

        <!-- Save Modal -->
        <div class="pm-modal pm-modal--save">
          <div class="pm-modal-content">
            <div class="pm-modal-title">SAVE PRESET</div>
            <input type="text" class="pm-modal-input" placeholder="Preset name...">
            <div class="pm-modal-categories">
              ${this.renderCategorySelect()}
            </div>
            <div class="pm-modal-actions">
              <button class="pm-modal-btn pm-modal-btn--cancel">Cancel</button>
              <button class="pm-modal-btn pm-modal-btn--confirm">Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        display: block;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .preset-manager {
        --pm-bg: rgba(20, 20, 25, 0.95);
        --pm-border: rgba(255, 107, 53, 0.2);
        --pm-orange: #FF6B35;
        --pm-cyan: #00D9FF;
        --pm-green: #39FF14;
        --pm-pink: #FF006E;
        --pm-text: #e0e0e0;
        --pm-dim: #888;
        --pm-hover: rgba(255, 255, 255, 0.05);
        
        background: var(--pm-bg);
        border: 1px solid var(--pm-border);
        border-radius: 16px;
        padding: 1rem;
        position: relative;
        overflow: hidden;
        max-height: 600px;
        display: flex;
        flex-direction: column;
      }

      .preset-manager--compact {
        max-height: 400px;
        padding: 0.75rem;
      }

      /* Header */
      .pm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .pm-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.2rem;
        letter-spacing: 2px;
        color: var(--pm-orange);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-icon {
        font-size: 1.1rem;
      }

      .pm-actions {
        display: flex;
        gap: 0.4rem;
      }

      .pm-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--pm-dim);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .pm-btn:hover {
        color: var(--pm-orange);
        border-color: var(--pm-orange);
        background: rgba(255, 107, 53, 0.1);
      }

      .pm-btn--save:hover {
        color: var(--pm-green);
        border-color: var(--pm-green);
        background: rgba(57, 255, 20, 0.1);
      }

      /* Search */
      .pm-search {
        position: relative;
        margin-bottom: 0.75rem;
      }

      .pm-search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--pm-dim);
        font-size: 0.8rem;
      }

      .pm-search-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.6rem 2rem 0.6rem 2.2rem;
        color: var(--pm-text);
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        transition: border-color 0.2s ease;
      }

      .pm-search-input:focus {
        outline: none;
        border-color: var(--pm-orange);
      }

      .pm-search-input::placeholder {
        color: var(--pm-dim);
      }

      .pm-search-clear {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: var(--pm-dim);
        cursor: pointer;
        padding: 0.25rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .pm-search-input:not(:placeholder-shown) + .pm-search-clear {
        opacity: 1;
      }

      .pm-search-clear:hover {
        color: var(--pm-orange);
      }

      /* Categories */
      .pm-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-bottom: 0.75rem;
      }

      .pm-category {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--pm-dim);
        padding: 0.35rem 0.7rem;
        border-radius: 15px;
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pm-category:hover {
        color: var(--pm-text);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .pm-category.active {
        color: var(--pm-orange);
        border-color: var(--pm-orange);
        background: rgba(255, 107, 53, 0.15);
      }

      /* Section Title */
      .pm-section-title {
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        color: var(--pm-dim);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pm-count {
        background: rgba(255, 255, 255, 0.05);
        padding: 0.15rem 0.5rem;
        border-radius: 10px;
        font-size: 0.6rem;
      }

      /* Favorites */
      .pm-favorites {
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .pm-favorites--empty {
        display: none;
      }

      .pm-favorites-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        max-height: 80px;
        overflow-y: auto;
      }

      .pm-fav-chip {
        background: rgba(255, 107, 53, 0.1);
        border: 1px solid rgba(255, 107, 53, 0.2);
        border-radius: 15px;
        padding: 0.3rem 0.7rem;
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        color: var(--pm-orange);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s ease;
      }

      .pm-fav-chip:hover {
        background: rgba(255, 107, 53, 0.2);
        border-color: var(--pm-orange);
      }

      .pm-fav-chip .star {
        font-size: 0.6rem;
      }

      /* Preset List */
      .pm-list {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .pm-list-content {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .pm-preset {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 0.6rem 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;
      }

      .pm-preset:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .pm-preset.active {
        background: rgba(255, 107, 53, 0.1);
        border-color: var(--pm-orange);
      }

      .pm-preset-info {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-width: 0;
      }

      .pm-preset-icon {
        font-size: 1rem;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        flex-shrink: 0;
      }

      .pm-preset-name {
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        color: var(--pm-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pm-preset-category {
        font-size: 0.6rem;
        color: var(--pm-dim);
        text-transform: uppercase;
      }

      .pm-preset-actions {
        display: flex;
        gap: 0.3rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .pm-preset:hover .pm-preset-actions {
        opacity: 1;
      }

      .pm-preset-btn {
        background: transparent;
        border: none;
        color: var(--pm-dim);
        cursor: pointer;
        padding: 0.25rem;
        font-size: 0.75rem;
        transition: color 0.2s ease;
      }

      .pm-preset-btn:hover {
        color: var(--pm-orange);
      }

      .pm-preset-btn.favorited {
        color: var(--pm-orange);
      }

      /* Current Preset */
      .pm-current {
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 107, 53, 0.05);
        border: 1px solid rgba(255, 107, 53, 0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .pm-current-label {
        font-family: 'Space Mono', monospace;
        font-size: 0.6rem;
        color: var(--pm-dim);
        text-transform: uppercase;
      }

      .pm-current-name {
        flex: 1;
        font-family: 'Space Mono', monospace;
        font-size: 0.85rem;
        color: var(--pm-orange);
        font-weight: bold;
      }

      .pm-current-actions {
        display: flex;
        gap: 0.3rem;
      }

      .pm-current-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--pm-dim);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        transition: all 0.2s ease;
      }

      .pm-current-btn:hover {
        color: var(--pm-orange);
        border-color: var(--pm-orange);
      }

      .pm-current-btn.active {
        color: var(--pm-orange);
        background: rgba(255, 107, 53, 0.15);
        border-color: var(--pm-orange);
      }

      /* Loading */
      .pm-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.9);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        z-index: 10;
      }

      .preset-manager.loading .pm-loading {
        display: flex;
      }

      .pm-spinner {
        width: 30px;
        height: 30px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--pm-orange);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Modal */
      .pm-modal {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.95);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 20;
      }

      .pm-modal.visible {
        display: flex;
      }

      .pm-modal-content {
        background: rgba(30, 30, 35, 0.98);
        border: 1px solid var(--pm-border);
        border-radius: 12px;
        padding: 1.25rem;
        width: 90%;
        max-width: 300px;
      }

      .pm-modal-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.1rem;
        letter-spacing: 1px;
        color: var(--pm-orange);
        margin-bottom: 1rem;
        text-align: center;
      }

      .pm-modal-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 0.7rem;
        color: var(--pm-text);
        font-family: 'Space Mono', monospace;
        font-size: 0.85rem;
        margin-bottom: 0.75rem;
      }

      .pm-modal-input:focus {
        outline: none;
        border-color: var(--pm-orange);
      }

      .pm-modal-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-bottom: 1rem;
      }

      .pm-modal-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .pm-modal-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pm-modal-btn--cancel {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: var(--pm-dim);
      }

      .pm-modal-btn--cancel:hover {
        border-color: rgba(255, 255, 255, 0.3);
        color: var(--pm-text);
      }

      .pm-modal-btn--confirm {
        background: var(--pm-orange);
        border: none;
        color: white;
        font-weight: bold;
      }

      .pm-modal-btn--confirm:hover {
        filter: brightness(1.1);
      }

      /* Empty State */
      .pm-empty {
        text-align: center;
        padding: 2rem;
        color: var(--pm-dim);
      }

      .pm-empty-icon {
        font-size: 2rem;
        margin-bottom: 0.75rem;
      }

      .pm-empty-text {
        font-size: 0.85rem;
      }

      /* Scrollbar */
      .pm-list-content::-webkit-scrollbar,
      .pm-favorites-list::-webkit-scrollbar {
        width: 4px;
      }

      .pm-list-content::-webkit-scrollbar-track,
      .pm-favorites-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .pm-list-content::-webkit-scrollbar-thumb,
      .pm-favorites-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }

      .pm-list-content::-webkit-scrollbar-thumb:hover,
      .pm-favorites-list::-webkit-scrollbar-thumb:hover {
        background: var(--pm-orange);
      }
    `;
  }

  renderCategories() {
    const categories = this._categories[this._workspace] || this._categories.techno;
    return categories.map(cat => `
      <button class="pm-category ${cat === this._category ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');
  }

  renderCategorySelect() {
    const categories = this._categories[this._workspace] || this._categories.techno;
    return categories.filter(c => c !== 'all').map(cat => `
      <button class="pm-category" data-save-category="${cat}">
        ${cat}
      </button>
    `).join('');
  }

  renderFavorites() {
    if (this._favorites.length === 0) {
      return '';
    }
    
    const favoritePresets = this._presets.filter(p => this._favorites.includes(p.id));
    return favoritePresets.map(preset => `
      <button class="pm-fav-chip" data-preset-id="${preset.id}">
        <span class="star">★</span>
        ${preset.name}
      </button>
    `).join('');
  }

  renderPresets() {
    const filtered = this.getFilteredPresets();
    
    if (filtered.length === 0) {
      return `
        <div class="pm-empty">
          <div class="pm-empty-icon">🎵</div>
          <div class="pm-empty-text">No presets found</div>
        </div>
      `;
    }
    
    return filtered.map(preset => `
      <div class="pm-preset ${this._currentPreset?.id === preset.id ? 'active' : ''}" 
           data-preset-id="${preset.id}">
        <div class="pm-preset-info">
          <span class="pm-preset-icon">${this.getCategoryIcon(preset.category)}</span>
          <div>
            <div class="pm-preset-name">${preset.name}</div>
            <div class="pm-preset-category">${preset.category}</div>
          </div>
        </div>
        <div class="pm-preset-actions">
          <button class="pm-preset-btn ${this.isFavorite(preset.id) ? 'favorited' : ''}" 
                  data-action="favorite" title="Toggle favorite">
            <i class="fas fa-star"></i>
          </button>
          <button class="pm-preset-btn" data-action="preview" title="Preview">
            <i class="fas fa-play"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  getCategoryIcon(category) {
    const icons = {
      bass: '🎸',
      lead: '🎹',
      pad: '☁️',
      drums: '🥁',
      fx: '✨',
      arp: '🔄',
      acid: '🧪',
      kick: '💥',
      sub: '🔊',
      synth: '🎛️',
      percussion: '🪘',
      hat: '🎩',
      ride: '🛎️',
      arp2600: '🎛️',
      guitar: '🎸',
      violin: '🎻',
      strings: '🎼',
      brass: '🎺',
      woodwind: '🪈',
      pluck: '🎸',
      keys: '🎹',
      vocal: '🎤',
      all: '🎵'
    };
    return icons[category] || '🎵';
  }

  getFilteredPresets() {
    let filtered = [...this._presets];
    
    // Category filter
    if (this._category !== 'all') {
      filtered = filtered.filter(p => p.category === this._category);
    }
    
    // Search filter
    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  attachEvents() {
    // Search input
    const searchInput = this.shadowRoot.querySelector('.pm-search-input');
    searchInput.addEventListener('input', (e) => {
      this._searchQuery = e.target.value;
      this.filterPresets();
    });

    // Search clear
    const searchClear = this.shadowRoot.querySelector('.pm-search-clear');
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      this._searchQuery = '';
      this.filterPresets();
    });

    // Category buttons
    this.shadowRoot.addEventListener('click', (e) => {
      const categoryBtn = e.target.closest('.pm-category[data-category]');
      if (categoryBtn) {
        this._category = categoryBtn.dataset.category;
        this.updateCategories();
        this.filterPresets();
      }
    });

    // Save button
    const saveBtn = this.shadowRoot.querySelector('.pm-btn--save');
    saveBtn.addEventListener('click', () => this.showSaveModal());

    // Random button
    const randomBtn = this.shadowRoot.querySelector('.pm-btn--random');
    randomBtn.addEventListener('click', () => this.loadRandomPreset());

    // Refresh button
    const refreshBtn = this.shadowRoot.querySelector('.pm-btn--refresh');
    refreshBtn.addEventListener('click', () => this.loadPresets());

    // Preset clicks
    this.shadowRoot.addEventListener('click', (e) => {
      const preset = e.target.closest('.pm-preset');
      if (preset) {
        const actionBtn = e.target.closest('.pm-preset-btn');
        if (actionBtn) {
          const action = actionBtn.dataset.action;
          const presetId = preset.dataset.presetId;
          if (action === 'favorite') {
            this.toggleFavorite(presetId);
          } else if (action === 'preview') {
            this.previewPreset(presetId);
          }
        } else {
          this.loadPreset(preset.dataset.presetId);
        }
      }
    });

    // Favorite chips
    this.shadowRoot.addEventListener('click', (e) => {
      const chip = e.target.closest('.pm-fav-chip');
      if (chip) {
        this.loadPreset(chip.dataset.presetId);
      }
    });

    // Current preset favorite toggle
    const currentFavBtn = this.shadowRoot.querySelector('.pm-current-btn--fav');
    currentFavBtn.addEventListener('click', () => {
      if (this._currentPreset) {
        this.toggleFavorite(this._currentPreset.id);
      }
    });

    // Copy preset
    const copyBtn = this.shadowRoot.querySelector('.pm-current-btn--copy');
    copyBtn.addEventListener('click', () => this.copyCurrentPreset());

    // Modal events
    const modal = this.shadowRoot.querySelector('.pm-modal--save');
    const cancelBtn = modal.querySelector('.pm-modal-btn--cancel');
    const confirmBtn = modal.querySelector('.pm-modal-btn--confirm');

    cancelBtn.addEventListener('click', () => this.hideSaveModal());
    confirmBtn.addEventListener('click', () => this.savePreset());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideSaveModal();
    });

    // Save category selection
    this.shadowRoot.addEventListener('click', (e) => {
      const saveCat = e.target.closest('.pm-category[data-save-category]');
      if (saveCat) {
        this.shadowRoot.querySelectorAll('.pm-category[data-save-category]').forEach(btn => {
          btn.classList.toggle('active', btn === saveCat);
        });
      }
    });
  }

  updateCategories() {
    const buttons = this.shadowRoot.querySelectorAll('.pm-category[data-category]');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === this._category);
    });
  }

  filterPresets() {
    const listContent = this.shadowRoot.querySelector('.pm-list-content');
    listContent.innerHTML = this.renderPresets();
    
    // Update count
    const count = this.shadowRoot.querySelector('.pm-list .pm-count');
    count.textContent = this.getFilteredPresets().length;
  }

  async loadPresets() {
    this.showLoading();
    
    try {
      // Try to load from API first
      const response = await fetch(`/api/presets?workspace=${this._workspace}`);
      if (response.ok) {
        this._presets = await response.json();
      } else {
        // Fallback to demo presets
        this._presets = this.getDemoPresets();
      }
    } catch (error) {
      console.warn('Failed to load presets from API, using demo presets:', error);
      this._presets = this.getDemoPresets();
    }
    
    this.hideLoading();
    this.updateUI();
  }

  getDemoPresets() {
    const categories = this._categories[this._workspace] || this._categories.techno;
    const presets = [];
    
    const names = [
      'Classic', 'Modern', 'Vintage', 'Deep', 'Acid', 'Fat', 'Warm', 'Cold',
      'Punchy', 'Smooth', 'Gritty', 'Clean', 'Dark', 'Bright', 'Heavy', 'Light'
    ];
    
    categories.filter(c => c !== 'all').forEach((category, catIndex) => {
      for (let i = 0; i < 5; i++) {
        presets.push({
          id: `${category}-${i}`,
          name: `${names[(catIndex + i) % names.length]} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          category,
          workspace: this._workspace,
          data: {} // Preset data would go here
        });
      }
    });
    
    return presets;
  }

  updateUI() {
    const listContent = this.shadowRoot.querySelector('.pm-list-content');
    listContent.innerHTML = this.renderPresets();
    
    const favList = this.shadowRoot.querySelector('.pm-favorites-list');
    if (favList) {
      favList.innerHTML = this.renderFavorites();
    }
    
    const favSection = this.shadowRoot.querySelector('.pm-favorites');
    if (favSection) {
      favSection.classList.toggle('pm-favorites--empty', this._favorites.length === 0);
    }
    
    // Update counts
    const listCount = this.shadowRoot.querySelector('.pm-list .pm-count');
    listCount.textContent = this.getFilteredPresets().length;
    
    const favCount = this.shadowRoot.querySelector('.pm-favorites .pm-count');
    if (favCount) {
      favCount.textContent = this._favorites.length;
    }
  }

  loadPreset(presetId) {
    const preset = this._presets.find(p => p.id === presetId);
    if (!preset) return;
    
    this._currentPreset = preset;
    this.updateCurrentDisplay();
    this.updateUI();
    
    this.dispatchEvent(new CustomEvent('preset-load', {
      detail: { preset },
      bubbles: true
    }));
  }

  updateCurrentDisplay() {
    const currentName = this.shadowRoot.querySelector('.pm-current-name');
    const currentFav = this.shadowRoot.querySelector('.pm-current-btn--fav');
    
    currentName.textContent = this._currentPreset?.name || 'No preset loaded';
    currentFav.classList.toggle('active', 
      this._currentPreset && this.isFavorite(this._currentPreset.id));
  }

  previewPreset(presetId) {
    const preset = this._presets.find(p => p.id === presetId);
    if (!preset) return;
    
    this.dispatchEvent(new CustomEvent('preset-preview', {
      detail: { preset },
      bubbles: true
    }));
  }

  loadRandomPreset() {
    const filtered = this.getFilteredPresets();
    if (filtered.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    this.loadPreset(filtered[randomIndex].id);
  }

  toggleFavorite(presetId) {
    const index = this._favorites.indexOf(presetId);
    if (index > -1) {
      this._favorites.splice(index, 1);
    } else {
      this._favorites.push(presetId);
    }
    
    this.saveFavorites();
    this.updateUI();
    this.updateCurrentDisplay();
  }

  isFavorite(presetId) {
    return this._favorites.includes(presetId);
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('haos_preset_favorites') || '[]');
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem('haos_preset_favorites', JSON.stringify(this._favorites));
  }

  showSaveModal() {
    const modal = this.shadowRoot.querySelector('.pm-modal--save');
    const input = modal.querySelector('.pm-modal-input');
    modal.classList.add('visible');
    input.value = '';
    input.focus();
  }

  hideSaveModal() {
    const modal = this.shadowRoot.querySelector('.pm-modal--save');
    modal.classList.remove('visible');
  }

  async savePreset() {
    const modal = this.shadowRoot.querySelector('.pm-modal--save');
    const input = modal.querySelector('.pm-modal-input');
    const categoryBtn = modal.querySelector('.pm-category.active[data-save-category]');
    
    const name = input.value.trim();
    const category = categoryBtn?.dataset.saveCategory || 'synth';
    
    if (!name) {
      input.focus();
      return;
    }
    
    this.dispatchEvent(new CustomEvent('preset-save', {
      detail: { name, category, workspace: this._workspace },
      bubbles: true
    }));
    
    this.hideSaveModal();
  }

  copyCurrentPreset() {
    if (!this._currentPreset) return;
    
    const data = JSON.stringify(this._currentPreset.data, null, 2);
    navigator.clipboard.writeText(data).then(() => {
      // Show feedback
      const copyBtn = this.shadowRoot.querySelector('.pm-current-btn--copy');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 1500);
    });
  }

  showLoading() {
    this._isLoading = true;
    const manager = this.shadowRoot.querySelector('.preset-manager');
    manager.classList.add('loading');
  }

  hideLoading() {
    this._isLoading = false;
    const manager = this.shadowRoot.querySelector('.preset-manager');
    manager.classList.remove('loading');
  }

  updateLayout() {
    const manager = this.shadowRoot.querySelector('.preset-manager');
    manager.classList.toggle('preset-manager--compact', this._compact);
  }

  // Public API methods
  setPresets(presets) {
    this._presets = presets;
    this.updateUI();
  }

  getCurrentPreset() {
    return this._currentPreset;
  }

  setCurrentPreset(preset) {
    this._currentPreset = preset;
    this.updateCurrentDisplay();
  }
}

// Register the custom element
customElements.define('haos-preset-manager', HAOSPresetManager);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSPresetManager;
}
