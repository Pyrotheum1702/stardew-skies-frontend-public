# Stardew Skies - Project Development Description

## Project Overview

**Project Name:** Stardew Skies
**Engine:** Cocos Creator 2.4.13 (Cocos2d-HTML5)
**Language:** TypeScript
**Platform:** Web-Mobile (Browser-based, Telegram WebApp compatible)
**Version:** 1.0.0
**Project ID:** 1e6a3419-ec6b-4609-8f06-493f76dc7247

## Project Summary

Stardew Skies is a web-based farming simulation game with optional Telegram WebApp compatibility. Players can plant seeds, water plants, add fertilizer, harvest crops, and expand their garden across multiple floors. The game includes social features like leaderboards, referral systems, and task completion mechanics. Can be played standalone in any web browser or integrated as a Telegram Mini App.

## ⚠️ Code Health Status

**Last Analysis:** 2026-01-29
**Last Cleanup:** 2026-01-29 (Phase 1: Removed dependencies + orphaned files)
**Documentation:** 2026-01-29 (Created comprehensive README.md)

| Category                   | Count   | Action Required                 |
| -------------------------- | ------- | ------------------------------  |
| Unused Dependencies        | 0       | ✅ **COMPLETED** - All removed  |
| Orphaned Files             | 0       | ✅ **COMPLETED** - All deleted  |
| Large Commented Blocks     | 2       | 🟡 Review and clean             |
| Dead Code Lines            | ~50-100 | 🟡 Clean up remaining           |
| Potential Bundle Reduction | ~2-3MB  | ✅ **COMPLETED** - Phase 1 done |

See [Unused/Deprecated Code Analysis](#unuseddeprecated-code-analysis) section for details.

## Technical Stack

### Core Technologies
- **Game Engine:** Cocos Creator 2.4.13
- **Language:** TypeScript (ES5 target, ES2015/ES2017 libs)
- **Runtime:** Cocos2d-HTML5
- **Build Target:** Web-Mobile

### Dependencies
- **@types/node** (v22.9.3) - Node.js type definitions (Dev dependency)

### Configuration
- **TypeScript Config:**
  - Module: CommonJS
  - Target: ES5
  - Experimental Decorators: Enabled
  - Output: temp/vscode-dist

## Project Structure

```
stardew-skies/
├── assets/
│   ├── 0.Fonts/           # Font resources
│   ├── 1.Scene/           # Cocos Creator scenes
│   │   ├── Load.fire      # Loading scene
│   │   └── Main.fire      # Main game scene
│   ├── 2.Script/          # TypeScript source code (62 files)
│   │   ├── Config/        # Configuration and constants
│   │   ├── Helper/        # Utility and helper classes
│   │   ├── Load/          # Loading controller
│   │   ├── Main/          # Main game logic
│   │   ├── Modules/       # Game feature modules
│   │   ├── Notification/  # Notification system
│   │   └── TelegramWebapp/ # Telegram integration
│   ├── 3.Asset/           # Game assets (sprites, animations)
│   ├── Audio/             # Audio files
│   └── Views/             # UI prefabs
├── build/                 # Build output directory
│   └── web-mobile/        # Web mobile build
├── build-templates/       # Build configuration templates
├── library/               # Cocos Creator library cache
├── packages/              # Editor packages
├── settings/              # Project settings
└── temp/                  # Temporary build files
```

## Core Architecture

### Main Systems

#### 1. Authentication & Login System
**Location:** [assets/2.Script/Modules/Login/](assets/2.Script/Modules/Login/)

- **Telegram WebApp authentication** (Optional integration)
- **Traditional username/password login** (UI currently disabled but can be re-enabled)
- **Session token management** (Active)
- **Auto-login with stored credentials** (Active)

#### 2. Garden Management System
**Location:** [assets/2.Script/Main/](assets/2.Script/Main/)

**Components:**
- **GardenFloorBuilder** - Multi-floor garden construction
  - Garden floor creation and management
  - Vine decorations and animations
  - Roof rendering
- **SlotManager** - Plant slot management
- **FarmingController** - Core farming mechanics
- **AssetContainer** - Asset loading and caching
- **FloorViewManager** - Floor navigation and display
- **ProfileInfoManager** - Player profile data

#### 3. Farming Mechanics
**Location:** [assets/2.Script/Main/Farming/](assets/2.Script/Main/Farming/)

**Features:**
- Plant pot placement
- Seed planting
- Plant watering
- Fertilizer application
- Bug catching
- Crop harvesting
- Slot management

#### 4. Game Modules

**Module Directory:** [assets/2.Script/Modules/](assets/2.Script/Modules/)

| Module                | Purpose                                | Status                     |
| --------------------- | -------------------------------------- | -------------------------- |
| **ActionBlock**       | UI action blocking during operations   | ✅ Active                   |
| **ConfirmationPopup** | Confirmation dialogs                   | ✅ Active                   |
| **Highlight**         | UI element highlighting system         | ✅ Active                   |
| **InventoryBar**      | Player inventory management            | ✅ Active                   |
| **Leaderboard**       | Player rankings and scores             | ✅ Active                   |
| **LevelUPPopup**      | Level up notifications                 | ✅ Active                   |
| **Login**             | Authentication interface               | ✅ Active                   |
| **LuckySpin**         | Lucky wheel mini-game                  | ✅ Active                   |
| **RedeemCode**        | Gift code redemption                   | ✅ Active                   |
| **Shop**              | In-game store                          | ✅ Active                   |
| **Task**              | Daily tasks and achievements           | ✅ Active                   |
| **TutorialDialog**    | Tutorial system                        | ✅ Active                   |
| **UnlockNewFloor**    | Floor unlock interface                 | ✅ Active                   |
| **UI**                | Common UI components                   | ✅ Active                   |
| ~~**Friend**~~        | ~~Friend system (inside ActionBlock)~~ | ✅ **DELETED** (2026-01-29) |

### Server Integration

#### API Operations (REQUEST_OPERATION)

**Authentication:**
- `LOGIN` (1010) - Standard login
- `LOGIN_TELEGRAM` (1020) - Telegram WebApp login

**Shop System:**
- `GET_SHOP` (2010) - Fetch shop items
- `MAKE_SHOP_PURCHASE` (2020) - Purchase items

**Garden Operations:**
- `GET_GARDEN` (3010) - Load player garden
- `SPECTATE_GARDEN` (3011) - View other gardens
- `PLACE_POT` (3015) - Place planting pot
- `PLANT_SEED` (3020) - Plant seed in pot
- `WATER_PLANT` (3021) - Water plant
- `ADD_FERTILIZER` (3023) - Apply fertilizer
- `CATCH_BUG` (3025) - Catch garden bugs
- `HARVEST_PLANT` (3030) - Harvest mature plant
- `ADD_FLOOR` (3510) - Unlock new garden floor

**Social Features:**
- `GET_REFERRAL_PROFILE` (4010) - Referral information
- `GET_TASK` (5010) - Fetch available tasks
- `DO_TASK` (5020) - Complete task
- `GET_LEADERBOARD` (6010) - Fetch leaderboard data

**Rewards:**
- `SUBMIT_GIFT_CODE` (7010) - Redeem gift codes
- `GET_LUCKY_SPIN_WHEEL` (8010) - Fetch lucky wheel state
- `SPIN_LUCKY_WHEEL` (8020) - Spin lucky wheel

## Game Features

### Core Gameplay
1. **Multi-Floor Garden System**
   - Expandable garden floors
   - Floor unlocking progression
   - Decorative vines and roofs

2. **Farming Mechanics**
   - Plant lifecycle management
   - Watering system
   - Fertilizer boosts
   - Bug catching mini-game
   - Harvest rewards

3. **Progression System**
   - Experience-based leveling
   - Level-up rewards
   - Base EXP requirement: 200 per level

4. **Economy System**
   - In-game shop
   - Currency management
   - Purchase transactions

### Social Features
1. **Leaderboard System**
   - Player rankings
   - Competitive scoring

2. **Referral Program**
   - Invite rewards
   - Profile tracking

3. **Task System**
   - Daily tasks
   - Achievement tracking
   - Task rewards

### Monetization & Rewards
1. **Lucky Spin Wheel**
   - Random reward system
   - Daily spin opportunities

2. **Gift Code System**
   - Promotional codes
   - Redemption rewards

3. **Shop System**
   - Item purchases
   - Currency transactions

### User Experience
1. **Tutorial System**
   - Step-by-step guidance
   - Feature introduction
   - Multiple tutorial stages

2. **Notification System**
   - Text notifications
   - Color-coded messages
   - Loading dialogs

3. **UI/UX Features**
   - Inventory bar
   - Confirmation popups
   - Highlight effects
   - Action blocking during operations

## Telegram WebApp Integration (Optional)

The game supports optional Telegram WebApp integration:
- **Standalone Mode:** Runs in any web browser without Telegram
- **Telegram Mode:** Optional automatic authentication when launched from Telegram
- **WebApp Lifecycle:** Handles Telegram WebApp initialization when available
- **Session Management:** Works with or without Telegram context
- **Deep Linking:** Token-based session support for both modes

## Development Workflow

### Current Branch
- **Active Branch:** `fe`
- **Main Branch:** (not specified)

### Build Process
1. Development in Cocos Creator IDE
2. TypeScript compilation to ES5
3. Web-mobile build output
4. Deployment to web hosting/Telegram

### Git Workflow
- Modified files tracked in `project.json` and `settings/project.json`
- Recent development on LoginPanel authentication
- Regular commits with short messages

## Configuration Constants

### Visual Offsets
- **Plant Offset Y:** 50px
- **Watering Can:** Position(-108, 255), Angle: -27°, Tilt: -53°
- **Fertilizer Bag:** Position(-108, 255), Angle: -30°, Tilt: -25°
- **Alert Position:** (60, 254) / Low position: (60, 174)

### Progression
- **Base EXP per Level:** 200

## Development Guidelines

### Code Organization
- **Decorators:** TypeScript decorators for Cocos Creator components
- **Naming Conventions:** PascalCase for classes, camelCase for variables
- **Module Pattern:** Feature-based module separation
- **Configuration:** Centralized in Config.ts

### Key Utilities
- **LocalStorage:** Client-side data persistence
- **GlobalVar:** Global state management
- **Utils:** Common utility functions
- **Loading Dialogs:** Async operation feedback

### Scene Management
1. **Load Scene** - Initial loading and authentication
2. **Main Scene** - Core gameplay
3. **Preloading** - Scene preloading for smooth transitions

## Unused/Deprecated Code Analysis

### Critical Findings: Code Cleanup Opportunities

#### 1. ~~Unused NPM Dependencies~~ ✅ **CLEANED UP** (2026-01-29)

| Dependency          | Version | Status    | Removed Date |
| ------------------- | ------- | --------- | ------------ |
| ~~canvg~~           | v4.0.2  | ✅ REMOVED | 2026-01-29   |
| ~~fast-xml-parser~~ | v4.5.0  | ✅ REMOVED | 2026-01-29   |
| ~~gpu.js~~          | v2.16.0 | ✅ REMOVED | 2026-01-29   |

**Impact:** ~2MB reduction in node_modules
**Status:** ✅ Completed - All unused dependencies removed from [package.json](package.json)
**Next Step:** Run `npm install` to clean up node_modules directory

---

#### 2. ~~Orphaned/Unused TypeScript Files~~ ✅ **CLEANED UP** (2026-01-29)

**~~SVGLoader.ts~~** - Deleted
- Contained: `loadSVGUsingAssetManager()` and `loadSVGAsTexture()`
- Status: ✅ **DELETED** - Zero references, completely orphaned
- Removed: 2026-01-29

**~~Friend.ts~~** - Deleted (entire Friend module directory)
- Entire Friend system deleted including:
  - Friend.ts (TypeScript component)
  - Friend.prefab (UI prefab)
  - Assets (friend-icon.png, ref.png)
- Status: ✅ **DELETED** - Only referenced in commented code
- Removed: 2026-01-29

---

#### 3. Large Commented Code Blocks

**~~TelegramWebapp.ts~~** - Deleted
- Entire file was commented code (49 lines)
- Contained: `callPurchaseTelegramItem()` and `TELEGRAM_SHOP_ITEM` constants
- Status: ✅ **DELETED** - Planned feature never implemented
- Removed: 2026-01-29

**LoginPanel.ts** (Lines 234-252) - [assets/2.Script/Modules/Login/LoginPanel.ts](assets/2.Script/Modules/Login/LoginPanel.ts:234-252)
- `onClickContinue()` method completely commented out
- Traditional username/password login logic
- Status: Temporarily disabled, can be re-enabled if needed
- Action: Remove if not planning to use traditional login, or re-enable if needed

**AssetContainer.ts** (Lines 33-40) - [assets/2.Script/Main/AssetContainer.ts](assets/2.Script/Main/AssetContainer.ts:33-40)
- 5 commented @property decorators:
  - blockInformationPopup (line 33)
  - confirmationPopup (line 35)
  - inviteFriendPopup (line 36)
  - notificationPopupPref (line 38)
  - rankIcons (line 40)
- Status: Unused UI references
- Action: Remove if components truly unused

---

#### 4. Scene-Attached Helper Components (Not imported but may be used)

These components are not imported anywhere but may be attached to scene nodes:

| Component            | File                                                                     | Likely Usage     |
| -------------------- | ------------------------------------------------------------------------ | ---------------- |
| **ScaleOnHover**     | [Helper/ScaleOnHover.ts](assets/2.Script/Helper/ScaleOnHover.ts)         | Scene attachment |
| **PositionLock**     | [Helper/PositionLock.ts](assets/2.Script/Helper/PositionLock.ts)         | Scene attachment |
| **BackgroundIdle**   | [Helper/BackgroundIdle.ts](assets/2.Script/Helper/BackgroundIdle.ts)     | Scene attachment |
| **CanvasController** | [Helper/CanvasController.ts](assets/2.Script/Helper/CanvasController.ts) | Scene attachment |

**Note:** These require scene file inspection to confirm if actually used.

---

#### 5. Deprecated Features & Legacy Code

**Authentication System Changes:**
- Traditional username/password login UI temporarily disabled (can be re-enabled)
- Telegram WebApp authentication added as optional method
- Session token login still supported

**Payment System:**
- Telegram in-app purchases planned but not implemented
- All payment code commented out

**Sound System:**
- Multiple commented audio control methods in [Helper/SoundPlayer.ts](assets/2.Script/Helper/SoundPlayer.ts)
- Legacy sound system references removed

---

#### 6. Scattered Commented Debug Code

Multiple files contain commented console.log statements and debug code:
- [Main/GardenBackground.ts](assets/2.Script/Main/GardenBackground.ts) - Lines 70, 75, 81, 83, 88, 94, 98, 105
- [Helper/LocalStorage.ts](assets/2.Script/Helper/LocalStorage.ts) - Commented data management methods
- [Main/UI/UIController.ts](assets/2.Script/Main/UI/UIController.ts) - Commented Friend.Instance calls
- Various farming and profile components

---

### Cleanup Priority Recommendations

#### 🔴 High Priority (Safe to remove immediately)
1. ✅ ~~Remove all 3 unused npm dependencies from package.json~~ **COMPLETED** (2026-01-29)
2. ✅ ~~Delete SVGLoader.ts (completely orphaned)~~ **COMPLETED** (2026-01-29)
3. ✅ ~~Delete TelegramWebapp.ts (entirely commented)~~ **COMPLETED** (2026-01-29)
4. ⬜ Remove LoginPanel.onClickContinue() commented method
5. ⬜ Clean AssetContainer.ts commented @property decorators

#### 🟡 Medium Priority (Review then remove)
6. ✅ ~~Remove Friend.ts module and entire Friend directory~~ **COMPLETED** (2026-01-29)
7. Clean up scattered console.log comments in production code
8. Remove legacy SoundPlayer commented methods

#### 🟢 Low Priority (Optional cleanup)
9. Inspect scene files for ScaleOnHover, PositionLock usage
10. Remove old LocalStorage commented methods
11. Clean up debug code in GardenBackground.ts

---

### Cleanup Impact Summary

#### ✅ Completed (Phase 1 - 2026-01-29)
- **Dependencies Removed:** 3 packages (canvg, fast-xml-parser, gpu.js)
- **Files Deleted:** 3 TypeScript files + 1 directory
  - SVGLoader.ts
  - TelegramWebapp.ts
  - Friend/ (entire directory with prefab and assets)
- **Bundle Size Reduction:** ~2-3MB
- **Code Lines Removed:** ~100+ lines

#### 🔄 Remaining Cleanup
- **File Count:** ~2 files with commented code
- **Code Lines:** ~50-100 lines of commented code
- **Maintenance Benefit:** Ongoing - clearer codebase

---

## Next Steps for Development

### Potential Enhancements
1. Additional garden floor variations
2. More plant species and crops
3. Seasonal events system
4. Guild/clan features
5. PvP garden competitions
6. Advanced tutorial improvements
7. Localization/internationalization
8. Performance optimizations
9. Analytics integration
10. A/B testing framework

### Technical Improvements
1. Code documentation
2. Unit testing framework
3. CI/CD pipeline
4. Error monitoring
5. Performance profiling
6. Asset optimization
7. Bundle size reduction
8. Caching strategies

## Notes for AI Assistant

When working on this project:
1. **File Paths:** Always use absolute paths from project root
2. **TypeScript:** Follow existing decorator patterns for Cocos components
3. **API Calls:** Reference REQUEST_OPERATION constants for server operations
4. **Configuration:** Check CONFIG object for game constants
5. **Modules:** Each feature should be self-contained in its module directory
6. **Scenes:** Main game logic in Main scene, authentication in Load scene
7. **Assets:** Verify asset paths before referencing in code
8. **Telegram:** Consider Telegram WebApp context for authentication flows

## Project Context

This is an active development project for a web-based farming game with optional Telegram WebApp integration. The codebase is structured for scalability with clear separation of concerns. The game leverages Cocos Creator's component system and TypeScript's type safety for robust development. It can run standalone in any web browser or be integrated as a Telegram Mini App.
