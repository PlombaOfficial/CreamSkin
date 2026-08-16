# ⛏️ Minecraft 2D // Full Sandbox Edition

A high-performance, full-featured procedural 2D Minecraft sandbox game built with **TypeScript**, **React**, **HTML5 Canvas**, **Web Audio API**, **IndexedDB**, and **Firebase Realtime / Firestore**.

---

## 🌟 Key Features

### 🌍 1. Infinite Procedural World & Biomes
- **Chunk-Based Engine**: 16×128 vertical chunk slices dynamically loaded, cached, and unmounted around the player.
- **Seeded Multi-Octave Noise**: Deterministic generation with unique terrain elevation, hill curves, and valleys.
- **Biomes**:
  - 🌲 **Plains & Forests**: Oak trees, rich grass, red poppies, and yellow dandelions.
  - 🌳 **Birch Groves**: Birch trees with distinctive white bark and golden foliage.
  - 🏜️ **Deserts**: Sand, sandstone strata, dead bushes, and cacti.
  - ❄️ **Snow Tundra**: Snow grass, powder snow, snowy pines, and frozen ice lakes.
  - 🕳️ **Subterranean Caves**: 2D Perlin worm cave networks, underground water reservoirs, and magma pools.
  - 🔥 **Magma Core & Bedrock**: Deepslate, lava pools, and indestructible bedrock boundary at Y=0.
- **Realistic Ore Vein Distribution**:
  - ⬛ Coal Ore (Y: 20–100)
  - 🟫 Iron Ore (Y: 10–60)
  - 🟨 Gold Ore (Y: 5–35)
  - 🟥 Redstone Ore (Y: 0–25)
  - 💎 Diamond Ore (Y: 0–18)
  - 🟩 Emerald Ore (Y: 40–90 high mountain stone)

---

### 💡 2. Smooth 2D Cellular Lighting & Atmosphere
- **BFS 0–15 Cellular Propagation**: Instantaneous light recalculation when blocks are placed or broken.
- **Dynamic Skylight**: Sunlight rays penetrate downwards from open sky and attenuate through liquids and leaves.
- **Block Light Sources**: Torches (Light 14), Lava (Light 15), Active Furnaces (Light 13), Glowing Redstone.
- **Day/Night Cycle & Skybox**:
  - 20-minute full day/night cycle with dawn, noon, sunset, and starry night sky.
  - Orbiting Sun and Moon with dynamic sky gradient and ambient darkness.
- **Dynamic Weather**:
  - Clear, Overcast, Rain, and Thunderstorms with realistic lightning flashes and thunderclaps.
  - Angled rain physics with surface contact splash droplets.

---

### 🎒 3. Survival, Inventory, Crafting & Machines
- **Survival Statistics**:
  - ❤️ 20 Health Points (10 Hearts with hurt flashes and invulnerability frames).
  - 🍗 20 Hunger Points (Exhaustion from sprinting/mining, health regeneration when full, starvation damage).
  - 🫧 20 Oxygen Points (Drowning underwater timer with bubble gauges).
  - 🟢 Experience System (XP orbs, level numbers, level-up sound).
- **Comprehensive Inventory**:
  - 9 Hotbar slots + 27 Main Bag slots + 4 Armor slots.
  - Drag-and-drop, quick slot assignment, stack splitting, and hotbar mouse-wheel cycling.
- **Full Crafting Station**:
  - **2×2 Hand Crafting** (Planks, Sticks, Torches, Basic Tools).
  - **3×3 Workbench Crafting** (Furnace, Chests, Iron/Gold/Diamond Pickaxes, Axes, Shovels, Swords, Doors, Ladders, Bread).
  - **Quick Recipe Book**: 1-click crafting shortcuts for all discovered items.
- **Interactive Storage & Machines**:
  - 📦 **Chests**: 27-slot permanent storage containers.
  - 🔥 **Furnaces**: Smelt ores into ingots and cook raw food with fuel timers and active flame animations.

---

### 👾 4. Mobs & Combat AI
- **Passive Mobs**:
  - 🐷 **Pigs**: Wander peaceful plains, jump over 1-block steps, drop raw porkchops.
  - 🐑 **Sheep**: Graze grass, wander gently.
- **Hostile Mobs**:
  - 🧟 **Zombies**: Aggro on player within 12 blocks, jump obstacles, melee attack with knockback, drop coal/loot.
  - 🏹 **Skeletons**: Ranged aggro, physical arrow projectiles.
  - 🟢 **Slimes**: Rhythmic jumping animation, bounce damage.
- **Combat Mechanics**: Weapon attack damage based on tier (Wood, Stone, Iron, Gold, Diamond), knockback impulse, critical hit star particles.

---

### 🔊 5. Zero-Dependency Web Audio Synthesizer
- Built on browser Web Audio API: Zero missing MP3 links or 404 audio errors.
- Material-specific footstep audio (Grass, Stone, Wood, Sand, Snow, Water).
- Digging and block breaking sounds, block placement thuds, tool whoosh, item pickup chimes, chest squeaks, zombie grunts, thunderclaps, and crafting chords.
- Master and SFX volume controls.

---

### 🌐 6. Real-Time Firebase Multiplayer & Global Chat
- **Firebase Authentication**: Anonymous Instant Play or Email/Password registration.
- **Presence & Movement**: Live multiplayer player coordinates, directions, walk animations, and held items.
- **World Synchronization**: Batched delta block modifications synced to Firestore.
- **Global Multiplayer Chat**: Real-time room chat with timestamps, player badges, spam protection, and auto-scroll.
- **Strict Security Rules (`firestore.rules`)**:
  - Verified user ownership (`request.auth.uid == userId`).
  - Strict payload validation (coordinate boundaries, health limits, non-empty text, rate limits).

---

### 📱 7. Responsive Mobile Touch Controls & PWA
- **Adaptive Touch Overlay**: Virtual analog D-pad for movement, Jump button, Mine/Attack button, Place/Use button, Inventory toggle, and Chat toggle.
- **Progressive Web App (PWA)**:
  - `manifest.json` for standalone desktop/mobile installation.
  - `sw.js` Service Worker with cache-first strategy for complete offline singleplayer capability.

---

## 🎮 Controls

| Action | Desktop (Keyboard & Mouse) | Mobile (Touch Controls) |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Left` / `Right` | Virtual D-Pad `◀` / `▶` |
| **Jump / Swim Up** | `W` / `Space` / `Up` | `▲ JUMP` Button |
| **Sprint** | `Shift` (while moving) | Double-Tap Direction |
| **Mine / Attack** | `Left Mouse Button` (Hold) | `⛏️ MINE` Button (Hold) |
| **Place / Use / Eat** | `Right Mouse Button` | `📦 USE` Button |
| **Hotbar Slots** | Keys `1` – `9` or `Mouse Wheel` | Tap Hotbar Slot |
| **Inventory & Crafting** | `E` | `🎒` Button |
| **Global Chat** | `C` | `💬` Button |
| **Game Menu / Pause** | `Escape` | `⚙️` Button |

---

## 🛠️ Development & Building

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Security & Firebase Rules
Deploy security rules directly with Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
