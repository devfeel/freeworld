# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program RPG game ("地下城传说" / Dungeon Legend) - a pixel-style turn-based RPG where players explore dungeons, fight monsters (skeletons, zombies, bosses), collect equipment, and progress through levels.

## Technology Stack

- **Platform**: WeChat Mini Program (微信小程序)
- **Language**: JavaScript (ES6+)
- **Markup**: WXML (WeChat Markup Language)
- **Styling**: WXSS (WeChat Style Sheets)
- **Rendering**: Canvas API for pixel-style game graphics
- **Storage**: WeChat local storage (`wx.setStorageSync`/`wx.getStorageSync`)

## Important Syntax Limitations

### WXML does NOT support optional chaining (`?.`)

WXML template expressions have limited JavaScript support. **Never use the optional chaining operator (`?.`) in WXML files.**

**❌ Incorrect (will cause compilation error):**
```xml
<view style="color: {{item.enhance?.color}}">
  +{{item.enhance?.level || 0}}
</view>
```

**✅ Correct (use traditional property checking):**
```xml
<view style="color: {{(item.enhance && item.enhance.color) || '#888'}}">
  +{{(item.enhance && item.enhance.level) || 0}}
</view>
```

**Alternative:** If the expression is too complex, move the logic to the `.js` file and pass the computed value to the template:
```javascript
// In .js file
data: {
  itemColor: item.enhance?.color || '#888',
  itemLevel: item.enhance?.level || 0
}
```

```xml
<!-- In .wxml file -->
<view style="color: {{itemColor}}">+{{itemLevel}}</view>
```

## Development Workflow

This is a WeChat Mini Program, not a Node.js project. There are no npm scripts.

1. **Development**: Open the project in WeChat Developer Tool (微信开发者工具)
2. **Build**: Automatic compilation during development in the WeChat Developer Tool
3. **Debug**: Use the built-in simulator and debugging tools
4. **Publish**: Upload to the WeChat Mini Program platform via the Developer Tool

## Architecture

### Global State Management (`app.js`)

The `app.js` file contains the `App()` instance which holds all global game state in `globalData`:

- `hero`: Player character data (stats, level, equipment, skills, progress)
- `bag`: Inventory data (items and gold)
- `currentBattle`: Current battle state reference
- `gameStatus`: Current game state ('idle', 'battling')

Key methods for game state operations:
- `saveGame()` / `loadGame()`: Persist game to local storage
- `getTotalStats()`: Calculate hero's total stats including equipment bonuses
- `addItem()`, `useItem()`, `equipItem()`, `unequipItem()`, `sellItem()`: Inventory management
- `addExp()`: Experience and level progression

### Core Systems

**Battle System** (`utils/battle-system.js`):
- Class-based turn-based combat system
- `BattleSystem` class manages battles with `startBattle()`, `heroAttack()`, `enemyAttack()`, `endBattle()`
- Event-driven architecture using `onEvent` callbacks and `emitEvent()` to communicate with pages
- Speed-based turn order (faster character acts first)
- 50% escape chance with `escape()`

**Canvas Drawing** (`utils/canvas-draw.js`):
- Utility functions for drawing pixel-style characters
- Handles heroes, skeletons, zombies, bosses with customizable colors and sizes
- Draws health bars, experience bars, damage numbers

**Game Utilities** (`utils/game-utils.js`):
- `calculateDamage()`: Damage calculation with defense, multiplier, +/-10% variance, 10% crit chance (1.5x)
- `checkDodge()`: Speed-based dodge rate (max 30%)
- `processDrops()`: Drop table processing with chance calculations
- Helper functions: `random()`, `chance()`, `formatNumber()`, `delay()`, `deepClone()`, `shuffle()`, `getRarityColor()`, `showToast()`, `showModal()`, `throttle()`, `debounce()`

### Data Configuration (`data/`)

Game data is separated into configuration files:

- `monsters.js`: Monster definitions with stats, skills, drops
- `items.js`: Equipment, potions, and item definitions with rarities
- `dungeons.js`: Dungeon levels, monster distributions, boss configurations

All data files export objects that can be imported with `require()`.

### Page Structure

Pages are organized in `pages/` with each page having `.js`, `.json`, `.wxml`, `.wxss` files:

- `main/`: Home/landing page
- `dungeon/`: Dungeon selection
- `dungeon-detail/`: Specific dungeon details and floor entry
- `battle/`: Combat interface
- `hero/`: Character stats and equipment management
- `bag/`: Inventory management
- `shop/`: Item shop

Routes are defined in `app.json` in the `pages` array.

### Tab Bar Configuration

The app uses a tab bar with 5 main sections: Home (主页), Dungeons (地下城), Shop (商城), Character (角色), Bag (背包). Tab bar configuration is in `app.json`.

### Equipment System

Hero equipment slots: `helmet`, `armor`, `shield`, `necklace`, `ring1`, `ring2`, `weapon`

Equipment stats (attack/defense) are added to hero's base stats in `getTotalStats()`. The `getAccessorySlot()` method determines which slot an accessory type should use based on item ID prefixes.

### Save System

Game state is automatically saved to WeChat local storage under the key `'gameData'`. Only `hero` and `bag` data are persisted. The game saves after significant events (items used, equipment changed, battles end).

To reset game progress: clear app cache or manually delete storage data in `app.js`'s `loadGame()`.
