# Multi Status Indicator Card

A compact, configurable Home Assistant custom card for displaying multiple entity states as labeled icons in a flexible grid layout.

## Key Features

- **Multi-entity support**: Switches, lights, locks, covers, fans, automations, and more
- **Tap-to-toggle**: Quick control with tap, long-press for more-info dialog
- **Accessibility**: Full keyboard navigation and screen reader support
- **Flexible layout**: Configurable columns, name positioning, custom colors and icons
- **Smart state handling**: Unavailable entities shown with alert icon
- **Per-item overrides**: Customize colors, icons, and timestamp visibility per entity

## Quick Example

```yaml
type: custom:multi-status-indicator-card
title: Sprinkler Zones
columns: 6
items:
  - entity: switch.zone_1
    name: 1
  - entity: switch.zone_2
    name: 2
  - entity: switch.zone_3
    name: 3
```

See the full documentation in the [README.md](https://github.com/sxdjt/multi-status-indicator-card/blob/main/README.md).
