class MultiStatusIndicatorCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && this.isConnected) {
      this._render();
    }
  }

  _render() {
    const config = this._config;
    const hass = this._hass;
    if (!config || !hass) return;

    const iconSize = config.icon_size || '20px';
    const fontSize = config.font_size || '11px';
    const showLastChanged = config.show_last_changed !== false;

    const card = document.createElement('ha-card');
    card.style.padding = '4px';
    card.style.margin = '0';
    card.style.boxShadow = 'none';
    card.style.background = 'none';

    const container = document.createElement('div');
    container.style.padding = '4px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '2px';

    if (config.title) {
      const title = document.createElement('div');
      title.textContent = config.title;
      title.style.fontSize = '14px';
      title.style.fontWeight = '600';
      title.style.margin = '0';
      title.style.padding = '0';
      title.style.marginBottom = '4px';
      container.appendChild(title);
    }

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${config.columns || 3}, 1fr)`;
    grid.style.gap = '4px';

    config.items.forEach((item) => {
      const stateObj = hass.states[item.entity];
      if (!stateObj) return;

      const isOn = stateObj.state === 'on';
      const color = isOn ? config.color_on || item.color_on || 'green' : config.color_off || item.color_off || 'red';

      const box = document.createElement('div');
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.fontSize = fontSize;
      box.style.padding = '4px';
      box.style.borderRadius = '6px';
      box.style.cursor = 'pointer';
      box.style.transition = 'transform 0.1s ease-in-out';
      box.title = `Tap to toggle ${item.name || stateObj.attributes.friendly_name || item.entity}`;

      box.addEventListener('click', () => {
        hass.callService('switch', 'toggle', { entity_id: item.entity });
      });

      const icon = document.createElement('ha-icon');
      icon.icon = isOn ? item.icon_on || 'mdi:toggle-switch' : item.icon_off || 'mdi:toggle-switch-off';
      icon.style.color = color;
      icon.style.width = iconSize;
      icon.style.height = iconSize;
      icon.style.marginBottom = '2px';

      const label = document.createElement('div');
      label.textContent = item.name || stateObj.attributes.friendly_name || item.entity;

      box.appendChild(icon);
      box.appendChild(label);

      if (showLastChanged) {
        const lastChanged = document.createElement('div');
        const lastDate = new Date(stateObj.last_changed);
        lastChanged.textContent = lastDate.toLocaleTimeString(hass.locale?.language || 'en-US', {
          hour: 'numeric', minute: '2-digit'
        });
        lastChanged.style.fontSize = '10px';
        lastChanged.style.color = 'var(--secondary-text-color)';
        box.appendChild(lastChanged);
      }

      grid.appendChild(box);
    });

    container.appendChild(grid);
    card.innerHTML = '';
    card.appendChild(container);
    this.innerHTML = '';
    this.appendChild(card);
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('multi-status-indicator-card', MultiStatusIndicatorCard);
