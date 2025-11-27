window.customCards = window.customCards || [];
window.customCards.push({
  type: 'multi-status-indicator-card',
  name: 'Multi Status Indicator Card',
  description: 'A grid display for multiple entity status indicators with toggle support'
});

console.info(
  `%c MULTI-STATUS-INDICATOR-CARD %c v2.2 `,
  'color: green; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

class MultiStatusIndicatorCard extends HTMLElement {
  constructor() {
    super();
    this._config = null;
    this._hass = null;
    this._root = null;
    this._container = null;
    this._styleElement = null;
    this._eventListenerAttached = false;
    this._pressTimer = null;
  }

  setConfig(config) {
    // Comprehensive config validation
    if (!config.items || !Array.isArray(config.items)) {
      throw new Error('items array is required');
    }

    if (config.items.length === 0) {
      throw new Error('At least one item is required');
    }

    if (config.items.some(item => !item.entity)) {
      throw new Error('Each item must have an entity property');
    }

    if (config.columns && (config.columns < 1 || config.columns > 12)) {
      throw new Error('columns must be between 1 and 12');
    }

    this._config = config;
    this._render();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._config || !this.isConnected) {
      return;
    }

    // Only render if this is the first hass set or if configured entities changed
    if (!oldHass || this._hasEntitiesChanged(oldHass, hass)) {
      this._render();
    }
  }

  _hasEntitiesChanged(oldHass, newHass) {
    // Get all entity IDs from config
    const entityIds = this._config.items
      .map(item => item.entity)
      .filter(entity => entity);

    // Check if any of our configured entities changed
    return entityIds.some(entityId => {
      const oldState = oldHass.states[entityId];
      const newState = newHass.states[entityId];
      return oldState !== newState;
    });
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('ha-card');
      this.appendChild(this._root);
      this._createStyles();
    }
  }

  _createStyles() {
    if (this._styleElement) return;

    this._styleElement = document.createElement('style');
    this._styleElement.textContent = `
      :host {
        display: block;
      }
      .card-container {
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px 0;
      }
      .status-grid {
        display: grid;
        gap: 4px;
      }
      .status-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
        background-color: transparent;
      }
      .status-item:hover {
        background-color: var(--ha-card-background, var(--card-background-color, rgba(128, 128, 128, 0.1)));
      }
      .status-item:active {
        transform: scale(0.95);
      }
      .status-item:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .status-item.unavailable {
        opacity: 0.5;
        cursor: default;
      }
      .status-item.unavailable:hover {
        background-color: transparent;
      }
      .status-item.unavailable:active {
        transform: none;
      }
      .item-name {
        text-align: center;
      }
      .item-time {
        font-size: 10px;
        color: var(--secondary-text-color);
      }
    `;
    this._root.appendChild(this._styleElement);
  }

  _render() {
    const { _config: config, _hass: hass } = this;
    if (!config || !hass || !this._root) return;

    const {
      icon_size = '20px',
      font_size = '11px',
      show_last_changed = true,
      columns = 3,
      color_on = 'green',
      color_off = 'red',
      title,
      name_position = 'below'
    } = config;

    this._root.style.cssText = 'padding:4px;margin:0;box-shadow:none;background:none';

    // Update dynamic grid columns
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.className = 'card-container';
      this._root.appendChild(this._container);
    }

    const html = `
      ${title ? `<div class="card-title">${this._escapeHtml(title)}</div>` : ''}
      <div class="status-grid" style="grid-template-columns: repeat(${columns}, 1fr); font-size: ${font_size};">
        ${config.items.map(item => this._renderItem(item, hass, {
          icon_size, font_size, show_last_changed, color_on, color_off, name_position
        })).join('')}
      </div>
    `;

    this._container.innerHTML = html;
    this._attachEventListeners();
  }

  _renderItem(item, hass, options) {
    const stateObj = hass.states[item.entity];
    const name = item.name || stateObj?.attributes?.friendly_name || item.entity;

    // Handle missing or unavailable entities
    if (!stateObj || ['unavailable', 'unknown'].includes(stateObj.state)) {
      return this._renderUnavailableItem(item, name, options);
    }

    const state = stateObj.state;
    const isOn = this._isOn(item.entity, stateObj);
    const color = isOn
      ? (item.color_on || options.color_on)
      : (item.color_off || options.color_off);
    const icon = isOn
      ? (item.icon_on || 'mdi:toggle-switch')
      : (item.icon_off || 'mdi:toggle-switch-off');

    // Check for item-level show_last_changed override, fall back to global
    const showLastChanged = item.show_last_changed !== undefined
      ? item.show_last_changed
      : options.show_last_changed;

    const nameHtml = `<div class="item-name">${this._escapeHtml(name)}</div>`;
    const iconHtml = `<ha-icon icon="${icon}" style="color:${color};width:${options.icon_size};height:${options.icon_size};margin-bottom:2px"></ha-icon>`;

    // Always render time container for consistent alignment, but make invisible when not shown
    const lastChangedHtml = `<div class="item-time" style="visibility:${showLastChanged ? 'visible' : 'hidden'}">${showLastChanged ? this._formatTime(stateObj.last_changed, hass) : '&nbsp;'}</div>`;

    const content = options.name_position === 'above'
      ? `${nameHtml}${iconHtml}${lastChangedHtml}`
      : `${iconHtml}${nameHtml}${lastChangedHtml}`;

    return `
      <div class="status-item"
           data-entity="${item.entity}"
           role="button"
           tabindex="0"
           aria-label="${this._escapeHtml(name)}, ${state}, tap to toggle"
           aria-pressed="${isOn}"
           title="Tap to toggle • Long press for details">
        ${content}
      </div>
    `;
  }

  _renderUnavailableItem(item, name, options) {
    return `
      <div class="status-item unavailable"
           role="status"
           aria-label="${this._escapeHtml(name)} is unavailable"
           title="${this._escapeHtml(name)} is unavailable">
        <ha-icon icon="mdi:alert-circle-outline"
                 style="color:var(--disabled-text-color);width:${options.icon_size};height:${options.icon_size};margin-bottom:2px"></ha-icon>
        <div class="item-name">${this._escapeHtml(name)}</div>
      </div>
    `;
  }

  _isOn(entityId, stateObj) {
    const { state, attributes } = stateObj;
    const domain = entityId.split('.')[0];

    // Domain-specific logic for determining "on" state
    switch (domain) {
      case 'cover':
        return state === 'open' || (attributes.current_position || 0) > 0;
      case 'climate':
        return state !== 'off';
      case 'lock':
        return state === 'unlocked';
      case 'person':
      case 'device_tracker':
        return state === 'home';
      case 'media_player':
        return ['playing', 'on'].includes(state);
      case 'binary_sensor':
        return state === 'on';
      default:
        return state === 'on';
    }
  }

  _attachEventListeners() {
    if (this._eventListenerAttached || !this._container) return;

    // Event delegation for better performance
    this._container.addEventListener('click', (e) => {
      const item = e.target.closest('.status-item');
      if (!item || !item.dataset.entity || item.classList.contains('unavailable')) return;
      this._handleItemClick(item.dataset.entity);
    });

    // Keyboard navigation support
    this._container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.status-item');
        if (item && item.dataset.entity && !item.classList.contains('unavailable')) {
          e.preventDefault();
          this._handleItemClick(item.dataset.entity);
        }
      }
    });

    // Long-press for more-info dialog
    this._container.addEventListener('pointerdown', (e) => {
      const item = e.target.closest('.status-item');
      if (!item || !item.dataset.entity) return;

      this._pressTimer = setTimeout(() => {
        this._showMoreInfo(item.dataset.entity);
        this._pressTimer = null;
      }, 500);
    });

    this._container.addEventListener('pointerup', () => {
      if (this._pressTimer) {
        clearTimeout(this._pressTimer);
        this._pressTimer = null;
      }
    });

    this._container.addEventListener('pointercancel', () => {
      if (this._pressTimer) {
        clearTimeout(this._pressTimer);
        this._pressTimer = null;
      }
    });

    this._eventListenerAttached = true;
  }

  async _handleItemClick(entity) {
    try {
      const domain = entity.split('.')[0];
      const stateObj = this._hass.states[entity];
      if (!stateObj) return;

      const service = this._getService(domain, stateObj.state);

      if (service) {
        await this._hass.callService(domain, service, { entity_id: entity });
      }
    } catch (err) {
      this._showError(`Failed to toggle ${entity}: ${err.message}`);
    }
  }

  _getService(domain, state) {
    // Handle different entity domains
    const domainServices = {
      switch: 'toggle',
      light: 'toggle',
      input_boolean: 'toggle',
      automation: 'toggle',
      fan: 'toggle',
      cover: 'toggle',
      lock: (state) => state === 'locked' ? 'unlock' : 'lock',
      climate: (state) => state === 'off' ? 'turn_on' : 'turn_off',
      media_player: (state) => state === 'off' ? 'turn_on' : 'turn_off'
    };

    let service = domainServices[domain];
    if (typeof service === 'function') {
      service = service(state);
    }

    if (service) {
      return service;
    }

    // Fallback: try generic toggle or turn_on/turn_off
    const hasToggle = ['on', 'off'].includes(state);
    if (hasToggle) {
      return state === 'off' ? 'turn_on' : 'turn_off';
    }

    return null;
  }

  _showMoreInfo(entityId) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _showError(message) {
    const event = new Event('hass-notification', {
      bubbles: true,
      composed: true
    });
    event.detail = { message };
    this.dispatchEvent(event);
  }

  _formatTime(timestamp, hass) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(hass.locale?.language || 'en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getCardSize() {
    return Math.ceil((this._config?.items?.length || 0) / (this._config?.columns || 3));
  }

  static getConfigElement() {
    return document.createElement('multi-status-indicator-card-editor');
  }

  static getStubConfig() {
    return {
      columns: 3,
      items: [
        { entity: 'switch.example', name: 'Example' }
      ]
    };
  }
}

customElements.define('multi-status-indicator-card', MultiStatusIndicatorCard);
