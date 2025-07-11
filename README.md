# React + Phaser Bingo Game Template

This project is a modern Bingo game built with React and Phaser, designed for real-time multiplayer play with robust state synchronization and smooth UI/UX.

## Features

- **React + Phaser Integration**: Combines React for UI and Phaser for game rendering.
- **Real-time Multiplayer**: Supports multiple players with server-client event synchronization.
- **Robust Sync**: Handles browser tab inactivity, missed events, and ensures game state is always correct.
- **Bingo Game Logic**: Classic 5x5 Bingo card, number drawing, marking, and win detection.
- **Responsive UI**: Works well on both desktop and mobile browsers.
- **Sound & Animation**: Engaging sound effects and smooth animations for game actions.

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Project
```bash
npm run dev
```
Open your browser at [http://localhost:8080](http://localhost:8080) (or the port shown in the terminal).

## Project Structure

- `src/`
  - `App.jsx` — Main React app, handles socket events and sync logic
  - `PhaserGame.jsx` — React wrapper for Phaser game
  - `game/`
    - `scenes/`
      - `MainMenu.ts` — Main menu scene
      - `Game.ts` — Main game logic and rendering
      - `Boot.ts`, `Preloader.ts`, `GameOver.ts` — Other scenes
    - `EventBus.js` — Event bus for communication
    - `main.js` — Game entry point
- `public/` — Static assets (images, sounds, etc.)
- `vite/` — Vite config files

## Key Sync Features
- All server events are queued and processed in order, even if the tab is inactive.
- On tab focus/visibility, the client requests a full sync (`reSyncNumbers`) to ensure no numbers are missed.
- The game state is never overwritten incorrectly after a Bingo is detected.
- User is notified if sync is delayed or out of sync.

## Customization
- You can easily change the Bingo card size, assets, or add new features by editing the scenes in `src/game/scenes/`.
- Sound and animation can be customized in the respective methods.

## Troubleshooting
- If you see sync or animation errors, check the browser console for details.
- For development, use the debug shortcuts (see code comments in `Game.ts`).

## License
MIT

---

**Happy Coding!**
