# CreamSkin // Minecraft Java Skin Platform & Studio

**CreamSkin** is a modern, high-performance web platform for creating, editing, previewing in 3D, and publishing Minecraft Java Edition skins. Built with **TypeScript**, **React**, **Three.js (WebGL)**, **Web Audio API**, **Firebase Auth & Firestore**, and **PWA**.

---

## 🌟 Features

### 🖌️ 1. Studio Skin Editor
- **Minecraft Java 64×64 Standard**: Pixel-perfect editing for Base (Layer 1) and Outer Overlay (Layer 2 - Hat, Jacket, Sleeves, Pants).
- **Comprehensive Toolset**:
  - ✏️ **Pencil (1px)**: Pixel-precise drawing.
  - 🖌️ **Brush (1-4px)**: Multi-pixel painting.
  - 🧹 **Eraser**: Pixel clearing for outer layer transparency.
  - 🪣 **Paint Bucket (Flood Fill)**: Region-aware flood fill.
  - 🧪 **Eyedropper**: Real-time color sampling from canvas.
  - 📏 **Line, Rectangle, Circle**: Geometric vector-like pixel tools.
  - ✨ **Noise / Shading Shader**: Micro-variation dithering for realistic shading.
  - 🪞 **Horizontal Symmetry / Mirror X**: Real-time left-right reflection.
- **50-Step Snapshot Undo & Redo** (`Ctrl+Z` / `Ctrl+Y`).
- **Canvas Zoom & Pan**: 300% to 1600% zoom with customizable grid overlay (`▦`).

---

### 🧍 2. Interactive 3D WebGL Model (Three.js)
- **Dual-Layer Geometry**: Base body + Outer extruded overlay with realistic 3D depth and studio lighting.
- **Classic vs Slim**: Switch between Classic (4px arms) and Slim / Alex (3px arms).
- **Character Poses & Animations**:
  - 🧘 **Idle**: Gentle breathing cycle.
  - 🚶 **Walk Cycle**: Synchronized arm and leg swinging.
  - 🧍 **T-Pose**: Character modeling stance.
- **Body Part Isolation**: Toggle visibility for Head, Torso, Arms, Legs, and Layer 2 Outer Overlay.

---

### 🎵 3. CreamSkin Radio (Web Audio Ambient Lo-Fi)
- Built-in relaxing procedural ambient lo-fi music player inspired by Minecraft soundtrack aesthetics.
- Multi-track selection, Play/Pause, Skip, Volume slider, and Mute without external audio dependencies.

---

### 🌐 4. Community Gallery, Social & Direct Messages
- **Discovery**: Explore, Trending, and Latest skin streams with category filters and search.
- **Interactive Ratings**: 1-to-5 star rating system with aggregate averages.
- **Direct Messages (DMs)**: Real-time private messaging between creators and players.
- **User Profiles**: Follow/unfollow creators, author collections, follower counts.
- **Content Moderation**: Built-in reporting system for inappropriate/stolen skins.

---

### 🔌 5. Minecraft Java Server Integration
- **Spigot / Paper Server Plugin**: Java source code in [`src/skin-studio/plugin/SkinStudioPlugin.java`](file:///c:/Users/meow5/Documents/projectiguiess/src/skin-studio/plugin/SkinStudioPlugin.java).
- **Commands**:
  - `/skin <id>` — Equip skin in-game.
  - `/skin set <id>` — Set skin permanently.
  - `/skin reset` — Revert to default skin.

---

## ⌨️ Controls & Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Undo** | `Ctrl + Z` |
| **Redo** | `Ctrl + Y` or `Ctrl + Shift + Z` |
| **Quick Save / Download PNG** | `Ctrl + S` |
| **Pan Canvas** | `Middle Mouse Click + Drag` |
| **Rotate 3D Character** | `Left Click + Drag` in 3D Viewport |
| **Zoom 3D Camera** | `Mouse Wheel` in 3D Viewport |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
