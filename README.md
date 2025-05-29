# Multi Status Indicator Card

A compact, configurable [Home Assistant](https://www.home-assistant.io/) custom card that displays multiple on/off entity states as labeled icons in a flexible grid layout. Supports optional tap-to-toggle, state-based coloring, and last-changed timestamps.

<img width="514" alt="Screenshot 2025-05-28 at 21 38 42" src="https://github.com/user-attachments/assets/c171a172-6fff-491a-85a3-595ec5e2dbf4" />


---

## 🔧 Features

- Compact layout optimized for dashboards
- Configurable number of columns
- Tap-to-toggle entities
- Custom icons for on/off states
- State-based color indicators
- Last changed time display (optional)
- Global and per-item customization
- Works great for sprinklers, lights, zones, and more

---

## Installation

1. Copy `multi-status-indicator-card.js` to `/config/www/multi-status-indicator-card/`

   e.g. ```git clone https://github.com/sxdjt/multi-status-indicator-card/ /config/www/```

3. Add resource in Settings > Dashboards > 3-dot-menu > Resources:
   ```
   URL: /local/multi-status-indicator-card/multi-status-indicator-card.js
   Type: JavaScript Module
   ```

## Example Usage

```
type: custom:multi-status-indicator-card
title: Sprinkler Zones
columns: 6
color_on: "#11FF11"
color_off: "#FF1111"
icon_size: "22px"
font_size: "12px"
show_last_changed: true
items:
  - entity: switch.zone_1
    name: 1
  - entity: switch.zone_2
    name: 2
  - entity: switch.zone_3
    name: 3
  - entity: switch.zone_4
    name: 4
  - entity: switch.zone_5
    name: 5
  - entity: switch.zone_6
    name: 6
```
## Configuration

| Option              | Type    | Default   | Description                          |
| ------------------- | ------- | --------- | ------------------------------------ |
| `title`             | string  | —         | Optional card title                  |
| `columns`           | number  | 3         | Number of columns in the grid layout |
| `color_on`          | string  | `"green"` | Default color when entity is ON      |
| `color_off`         | string  | `"red"`   | Default color when entity is OFF     |
| `icon_size`         | string  | `"20px"`  | Size of the icons                    |
| `font_size`         | string  | `"11px"`  | Font size for item names             |
| `show_last_changed` | boolean | `true`    | Show last-changed timestamp          |
| `items`             | array   | —         | List of entities to show (see below) |

### Item Options

| Option      | Type   | Default                             | Description                      |
| ----------- | ------ | ----------------------------------- | -------------------------------- |
| `entity`    | string | —                                   | The entity to monitor (required) |
| `name`      | string | Friendly name or entity ID fallback | Label shown below the icon       |
| `icon_on`   | string | `'mdi:toggle-switch'`               | Icon when state is ON            |
| `icon_off`  | string | `'mdi:toggle-switch-off'`           | Icon when state is OFF           |
| `color_on`  | string | Inherits from global `color_on`     | Override ON color for this item  |
| `color_off` | string | Inherits from global `color_off`    | Override OFF color for this item |

