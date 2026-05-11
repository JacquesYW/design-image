# design-image

中文说明: [README.zh-CN.md](./README.zh-CN.md)

Note: This is a personal hobby project, originally built to help my child create homework-related visual materials.

`design-image` is a browser-based visual editor for composing poster-like images with text, pictures, QR codes, multi-panel canvases, and timeline animations.

Demo: https://jacquesyw.github.io/design-image/

## Features

- Multi-panel canvas editing with independent panel size and background settings
- Built-in templates for quickly switching to preset compositions
- Add image layers, text layers, and QR code layers to the canvas
- Rich text editing controls including font family, font size, alignment, line height, letter spacing, fill, and stroke
- Drag, resize, rotate, and select multiple layers on the canvas
- Layer alignment and distribution tools for batch layout adjustment
- Layer ordering controls such as bring forward, send backward, top, and bottom
- Group-aware editing, duplication, deletion, and lock/unlock operations
- Undo and redo support during editing
- Background image replacement and background color switching
- Canvas guide line support
- Export to PNG
- Animated preview and APNG export

## Typical Use Cases

- Marketing poster composition
- Activity or campaign image generation
- Social card and share image editing
- QR code poster assembly
- Multi-page visual content prototyping

## Tech Stack

- React 18
- TypeScript
- Vite
- Ant Design
- Less
- `html-to-image`
- `moveable`
- `selecto`
- `gsap`
- `quill`

## Project Structure

```text
src/
  pages/design/         main editor page and editing workflow
  pages/components/     reusable material and editor components
  utils/                transform, layer, image, and helper utilities
  assets/               built-in templates, demo images, and styles
```

## Local Development

```bash
pnpm install
pnpm start
```

Build production assets:

```bash
pnpm build
```

## Deployment

This repository is configured for GitHub Pages via GitHub Actions.

- Source: `GitHub Actions`
- Production URL: `https://jacquesyw.github.io/design-image/`

## Notes

- The current repository includes built-in sample assets and templates for demo purposes.
- The app is configured with a Vite `base` path for GitHub Pages project-site deployment.
