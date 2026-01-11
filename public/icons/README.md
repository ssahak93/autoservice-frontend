# PWA Icons

This directory should contain the following icon files for Progressive Web App (PWA) support:

## Required Icons

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels (recommended minimum)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (required for PWA)

## Icon Design Guidelines

1. **Design**: Use a simple, recognizable icon that represents Auto Service Connect
2. **Background**: Use a solid color background (recommended: primary brand color #3b82f6)
3. **Foreground**: Use white or contrasting color for the icon symbol
4. **Padding**: Leave 10-20% padding around the icon for better visibility
5. **Format**: PNG format with transparency support
6. **Maskable**: Icons should work as both "any" and "maskable" icons

## Generating Icons

You can use online tools like:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

Or use image editing software to create icons from a base design.

## Quick Start

1. Create a base icon design (512x512px recommended)
2. Use an icon generator tool to generate all required sizes
3. Place all generated icons in this directory
4. Update `manifest.json` if needed

## Note

The app will work without these icons, but PWA installation and home screen icons will not display properly until icons are added.
