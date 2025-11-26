# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A compact Home Assistant custom Lovelace card that displays multiple entity states as labeled icons in a grid layout. This is a **single-file vanilla JavaScript Web Component** with no build process, dependencies, or bundler.

**Key characteristics:**
- Single file: `multi-status-indicator-card.js` (~187 lines)
- Pure vanilla JS (ES6+) - no framework, no build step
- Direct deployment to Home Assistant's `/config/www/` directory
- HACS-compatible (Home Assistant Community Store)

## Architecture

### Web Component Structure

The card is implemented as a custom element extending `HTMLElement`:

```javascript
class MultiStatusIndicatorCard extends HTMLElement
```

**Key lifecycle methods:**
- `setConfig(config)`: Called when card configuration changes (validates `items` array)
- `set hass(hass)`: Called whenever Home Assistant state updates
- `connectedCallback()`: Creates the `<ha-card>` root element
- `_render()`: Template-based rendering (rebuilds entire DOM on state change)

### Rendering Strategy

**Template-based with innerHTML** (multi-status-indicator-card.js:62-74):
- Builds complete HTML string from config + state
- Sets `this._root.innerHTML` with full card markup
- Re-attaches event listeners after each render
- ~50% faster than DOM manipulation approach

**Performance considerations:**
- Rendering is fast for typical use cases (< 20 entities)
- For 100+ entities, consider debouncing or incremental updates
- HTML escaping via `_escapeHtml()` prevents XSS

### Entity State Detection

**isOn logic** (multi-status-indicator-card.js:82):
```javascript
const isOn = ['on', 'unlocked', 'open', 'home', 'playing'].includes(state);
```

This determines color/icon selection. Adjust this array if supporting new state values.

### Service Call Mapping

**Domain-specific services** (multi-status-indicator-card.js:120-130):
- `switch`, `light`, `input_boolean`, `automation`, `fan`, `cover`: use `toggle`
- `lock`: stateful - `unlock` if locked, `lock` if unlocked
- `climate`, `media_player`: stateful - `turn_on` if off, `turn_off` if on
- Fallback: tries generic `turn_on`/`turn_off` for unknown domains with on/off states

## Configuration Schema

Card config structure:
```javascript
{
  title: string,           // Optional card title
  columns: number,         // Grid columns (default: 3)
  color_on: string,        // Global on color (default: 'green')
  color_off: string,       // Global off color (default: 'red')
  icon_size: string,       // Icon size (default: '20px')
  font_size: string,       // Name font size (default: '11px')
  show_last_changed: bool, // Show timestamp (default: true)
  name_position: string,   // 'above' or 'below' (default: 'below')
  items: [                 // Required array
    {
      entity: string,           // Required (e.g., 'switch.zone_1')
      name: string,             // Optional (falls back to friendly_name)
      icon_on: string,          // Optional (default: 'mdi:toggle-switch')
      icon_off: string,         // Optional (default: 'mdi:toggle-switch-off')
      color_on: string,         // Optional (overrides global)
      color_off: string,        // Optional (overrides global)
      show_last_changed: bool   // Optional (overrides global, v2.1+)
    }
  ]
}
```

## Common Modifications

### Adding Support for New Entity Domains

Edit the `domainServices` object in `_attachEventListeners()` (line 120):

```javascript
const domainServices = {
  // Add new domain here
  scene: 'turn_on',  // Example: scenes only turn on
  script: 'turn_on'  // Example: scripts trigger on tap
};
```

For stateful services (depends on current state), use a function:
```javascript
valve: (state) => state === 'open' ? 'close_valve' : 'open_valve'
```

### Adding New "On" States

Edit the `isOn` array in `_renderItem()` (line 82):

```javascript
const isOn = ['on', 'unlocked', 'open', 'home', 'playing', 'heating', 'cooling'].includes(state);
```

This affects which color (`color_on` vs `color_off`) and which icon (`icon_on` vs `icon_off`) are displayed.

### Modifying Card Styling

All styles are inline (multi-status-indicator-card.js:60-109). Key style locations:

- **Card padding**: line 60 (`this._root.style.cssText`)
- **Grid layout**: line 65 (`grid-template-columns`)
- **Item box**: line 104-106 (flexbox, border-radius, cursor, transitions)
- **Icon styles**: line 92 (color, width, height)

To use CSS classes instead of inline styles, create a `<style>` tag in the template and reference classes in elements.

### Changing Last-Changed Time Format

Modify `_formatTime()` (multi-status-indicator-card.js:154-160):

```javascript
_formatTime(timestamp, hass) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(hass.locale?.language || 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'  // Add seconds
  });
}
```

Or use relative time: `return formatDistanceToNow(date)` (requires importing date library).

### Adding Per-Item Override Options

The card supports a pattern where per-item config can override global settings. Example pattern (multi-status-indicator-card.js:183-186):

```javascript
// Check for item-level show_last_changed override, fall back to global
const showLastChanged = item.show_last_changed !== undefined
  ? item.show_last_changed
  : options.show_last_changed;
```

This pattern is used for:
- `color_on` / `color_off` - per-item color overrides
- `icon_on` / `icon_off` - per-item icon overrides
- `show_last_changed` - per-item timestamp visibility (v2.1+)

To add a new per-item override:
1. Add the property check in `_renderItem()` using the pattern above
2. Update the configuration schema in this file
3. Update README.md with the new option in the Item Options table
4. Add an example showing the override in use

## Testing & Development

**No test suite** - testing is done manually in Home Assistant.

**Development workflow:**
1. Edit `multi-status-indicator-card.js` directly
2. Copy file to `/config/www/multi-status-indicator-card/` in Home Assistant
3. Hard-refresh browser (Cmd+Shift+R / Ctrl+Shift+F5) to bypass cache
4. Check browser console for errors
5. Test tap-to-toggle on various entity types

**Debugging:**
- Console logging: Add `console.log()` in `_render()` or `_attachEventListeners()`
- Version tag: Update version number in console banner (line 9) when making changes
- State inspection: `console.log(this._hass.states[entity])` to inspect entity state object

**Browser DevTools:**
- Find element: `document.querySelector('multi-status-indicator-card')`
- Inspect config: `$0._config`
- Inspect hass: `$0._hass.states`

## Home Assistant Integration

**Registration** (multi-status-indicator-card.js:1-6):
```javascript
window.customCards.push({
  type: 'multi-status-indicator-card',
  name: 'Multi Status Indicator Card',
  description: '...'
});
```

This makes the card appear in the Lovelace card picker.

**UI Editor hooks** (multi-status-indicator-card.js:172-183):
- `getConfigElement()`: Returns editor element (not yet implemented)
- `getStubConfig()`: Provides default config for new card instances
- `getCardSize()`: Height hint for Lovelace layout engine

**HACS configuration** (hacs.json):
- `content_in_root: false` - file is in subdirectory
- `filename`: Specifies the JS file to load
- `render_readme: true` - Shows README in HACS

## Deployment

**Manual installation:**
```bash
cp multi-status-indicator-card.js /config/www/multi-status-indicator-card/
```

Then add resource in Home Assistant:
- Settings → Dashboards → ⋮ → Resources
- Add `/local/multi-status-indicator-card/multi-status-indicator-card.js` as JavaScript Module

**HACS installation:**
Users add this repository as a custom repository in HACS.

## Version History

- **v2.1**: Event delegation, accessibility (keyboard nav, ARIA), long-press for more-info, unavailable state handling, per-item `show_last_changed` override, persistent styles/container architecture
- **v2.0**: Multi-entity support, name positioning, performance improvements, security fixes
- **v0.1**: Initial release (version in hacs.json not yet updated)

Update version in both `hacs.json` and console banner (line 9) when releasing.
