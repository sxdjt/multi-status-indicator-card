window.customCards = window.customCards || [];
window.customCards.push({
  type: 'multi-status-indicator-card',
  name: 'Multi Status Indicator Card',
  description: 'A grid display for multiple entity status indicators with toggle support'
});

console.info(
  `%c MULTI-STATUS-INDICATOR-CARD %c v2.0 `,
  'color: green; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

class MultiStatusIndicatorCard extends HTMLElement {
  constructor() {
    super();
    this._config = null;
    this._hass = null;
    this._root = null;
  }

  setConfig(config) {
    if (!config.items || !Array.isArray(config.items)) {
      throw new Error('items array is required');
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && this.isConnected) {
      this._render();
    }
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('ha-card');
      this.appendChild(this._root);
    }
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

    // Build styles inline for better performance
    this._root.style.cssText = 'padding:4px;margin:0;box-shadow:none;background:none';

    const html = `
      <div style="padding:4px;display:flex;flex-direction:column;gap:2px">
        ${title ? `<div style="font-size:14px;font-weight:600;margin:0 0 4px 0">${this._escapeHtml(title)}</div>` : ''}
        <div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:4px">
          ${config.items.map(item => this._renderItem(item, hass, {
            icon_size, font_size, show_last_changed, color_on, color_off, name_position
          })).join('')}
        </div>
      </div>
    `;

    this._root.innerHTML = html;
    this._attachEventListeners();
  }

  _renderItem(item, hass, options) {
    const stateObj = hass.states[item.entity];
    if (!stateObj) return '';

    const state = stateObj.state;
    const isOn = ['on', 'unlocked', 'open', 'home', 'playing'].includes(state);
    const color = isOn 
      ? (item.color_on || options.color_on)
      : (item.color_off || options.color_off);
    const icon = isOn 
      ? (item.icon_on || 'mdi:toggle-switch')
      : (item.icon_off || 'mdi:toggle-switch-off');
    const name = item.name || stateObj.attributes.friendly_name || item.entity;

    const nameHtml = `<div>${this._escapeHtml(name)}</div>`;
    const iconHtml = `<ha-icon icon="${icon}" style="color:${color};width:${options.icon_size};height:${options.icon_size};margin-bottom:2px"></ha-icon>`;
    
    const lastChangedHtml = options.show_last_changed 
      ? `<div style="font-size:10px;color:var(--secondary-text-color)">${this._formatTime(stateObj.last_changed, hass)}</div>`
      : '';

    const content = options.name_position === 'above' 
      ? `${nameHtml}${iconHtml}${lastChangedHtml}`
      : `${iconHtml}${nameHtml}${lastChangedHtml}`;

    return `
      <div class="status-item" data-entity="${item.entity}" 
           style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  font-size:${options.font_size};padding:4px;border-radius:6px;cursor:pointer;
                  transition:transform 0.1s ease-in-out"
           title="Tap to toggle ${this._escapeHtml(name)}">
        ${content}
      </div>
    `;
  }

  _attachEventListeners() {
    this._root.querySelectorAll('.status-item').forEach(box => {
      box.addEventListener('click', (e) => {
        const entity = e.currentTarget.dataset.entity;
        const domain = entity.split('.')[0];
        
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
        
        const stateObj = this._hass.states[entity];
        if (!stateObj) return;
        
        let service = domainServices[domain];
        if (typeof service === 'function') {
          service = service(stateObj.state);
        }
        
        if (service) {
          this._hass.callService(domain, service, { entity_id: entity });
        } else {
          // Fallback: try generic toggle or turn_on/turn_off
          const hasToggle = ['on', 'off'].includes(stateObj.state);
          if (hasToggle) {
            const fallbackService = stateObj.state === 'off' ? 'turn_on' : 'turn_off';
            this._hass.callService(domain, fallbackService, { entity_id: entity });
          }
        }
      });
    });
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
