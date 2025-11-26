# Release Preparation for HACS v2.1.0

This repository is now prepared for release to HACS (Home Assistant Community Store).

## Completed Preparations

### 1. **Updated hacs.json**
Using the latest HACS template format with only required fields:
```json
{
  "name": "Multi Status Indicator Card",
  "filename": "multi-status-indicator-card.js",
  "render_readme": true
}
```

Removed deprecated fields:
- `content_in_root` (not needed, file is in root)
- `domains` (not a valid field)
- `country` (not applicable)
- `zip_release` (not using zipped releases)
- `version` (managed via git tags)
- `description` (shown via README)

### 2. **Version Updated**
- JS file: `v2.1` (line 9)
- All documentation reflects v2.1 features

### 3. **Documentation Updated**
- **README.md**: Full v2.1 changelog, updated examples
- **info.md**: Enhanced for HACS display with quick example
- **CHANGELOG.md**: Comprehensive version history following Keep a Changelog format
- **CLAUDE.md**: Technical documentation for future development

### 4. **Repository Structure**
```
multi-status-indicator-card/
├── multi-status-indicator-card.js  ← Main card file (v2.1)
├── hacs.json                        ← HACS manifest
├── README.md                        ← Primary documentation
├── info.md                          ← HACS info panel
├── CHANGELOG.md                     ← Version history
├── CLAUDE.md                        ← Developer guide
└── LICENSE                          ← License file
```

## Release Checklist

Before creating the GitHub release:

- [ ] Verify all changes are committed
- [ ] Test the card in Home Assistant
- [ ] Review README for accuracy
- [ ] Check that examples work
- [ ] Verify links in documentation

## Creating the GitHub Release

### Step 1: Create Git Tag
```bash
git tag -a v2.1.0 -m "Release v2.1.0 - Accessibility, per-item overrides, long-press support"
git push origin v2.1.0
```

### Step 2: Create GitHub Release
1. Go to: https://github.com/sxdjt/multi-status-indicator-card/releases/new
2. **Tag**: `v2.1.0`
3. **Release title**: `v2.1.0 - Accessibility & Per-Item Overrides`
4. **Description**: Use the v2.1.0 section from CHANGELOG.md:

```markdown
## What's New in v2.1.0

### Added
- **Per-item `show_last_changed` override**: Individual items can now override the global `show_last_changed` setting
- **Full accessibility support**:
  - Keyboard navigation with Tab, Enter, and Space keys
  - ARIA labels and roles for screen readers
  - Focus indicators with visible outline
- **Long-press support**: Hold any item for 500ms to open the more-info dialog
- **Unavailable state handling**: Entities that are unavailable or unknown now display a grayed-out alert icon
- **Error notifications**: Failed service calls now show toast notifications with error details

### Changed
- **Event handling**: Switched to event delegation pattern for better performance
- **DOM architecture**: Styles and container are now created once and persisted
- **Smart state detection**: Domain-aware logic for determining "on" state

### Fixed
- **Icon alignment**: Icons now properly align when mixing items with and without timestamps
- **Render thrashing**: Eliminated constant DOM recreation that caused flickering

See [CHANGELOG.md](CHANGELOG.md) for complete version history.
```

5. Click **Publish release**

## HACS Installation

Once the release is published, users can install via HACS:

### For Default HACS Repository (if accepted)
1. HACS → Frontend
2. Search for "Multi Status Indicator Card"
3. Click Install

### For Custom Repository (current method)
1. HACS → Frontend → ⋮ (three dots) → Custom repositories
2. Add: `https://github.com/sxdjt/multi-status-indicator-card`
3. Category: Lovelace
4. Click "Multi Status Indicator Card" → Install

## HACS Requirements Met

Based on [HACS Plugin Documentation](https://www.hacs.xyz/docs/publish/plugin/):

- **Repository structure**: JavaScript file in root
- **Naming convention**: `multi-status-indicator-card.js` matches expected pattern
- **hacs.json**: Present with required fields
- **README.md**: Comprehensive documentation
- **GitHub Releases**: Will use semantic versioning (v2.1.0)
- **License**: MIT license included

## References

- [HACS Plugin (Dashboard) Requirements](https://www.hacs.xyz/docs/publish/plugin/)
- [HACS hacs.json Documentation](https://www.hacs.xyz/docs/publish/start/)
- [Boilerplate Card Reference](https://github.com/custom-cards/boilerplate-card)
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## Next Steps

1. Test the card thoroughly in a live Home Assistant instance
2. Create the v2.1.0 git tag and GitHub release
3. Update repository description on GitHub (if needed)
4. Consider submitting to HACS default repository (optional)
5. Share release announcement in Home Assistant community forums (optional)

---

**Note**: This release package was prepared following the latest HACS requirements as of January 2025.
