# 🌱 Stardew Skies

A web-based farming simulation game built with Cocos Creator. Plant seeds, water crops, expand your garden across multiple floors, and compete with friends on the leaderboard! Compatible with Telegram WebApp for seamless in-app gaming.

[![Cocos Creator](https://img.shields.io/badge/Cocos%20Creator-2.4.13-blue.svg)](https://www.cocos.com/en/creator)
[![TypeScript](https://img.shields.io/badge/TypeScript-ES5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎮 Features

### Core Gameplay
- **Multi-Floor Garden System** - Expand your garden vertically with unlockable floors
- **Plant Lifecycle Management** - Plant seeds, water, fertilize, and harvest crops
- **Farming Mechanics** - Watering system, fertilizer boosts, and bug catching mini-game
- **Progression System** - Experience-based leveling with rewards

### Social Features
- **Leaderboard** - Compete with other players globally
- **Referral System** - Invite friends and earn rewards
- **Task System** - Complete daily tasks and achievements

### Monetization & Rewards
- **In-Game Shop** - Purchase seeds, tools, and decorations
- **Lucky Spin Wheel** - Daily spin opportunities for random rewards
- **Gift Code System** - Redeem promotional codes

### User Experience
- **Tutorial System** - Step-by-step guidance for new players
- **Multiple Login Options** - Traditional login or Telegram WebApp integration
- **Responsive UI** - Optimized for mobile web browsers

## 🛠️ Tech Stack

- **Game Engine:** Cocos Creator 2.4.13 (Cocos2d-HTML5)
- **Language:** TypeScript (compiled to ES5)
- **Platform:** Web-Mobile (Browser-based)
- **Optional Integration:** Telegram WebApp API (compatible)
- **Build Target:** Web (HTML5)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Cocos Creator 2.4.13](https://www.cocos.com/en/creator/download)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pyrotheum1702/stardew-skies-frontend-public.git
   cd stardew-skies-frontend-public
   ```

2. **Open in Cocos Creator**
   - Launch Cocos Creator 2.4.13
   - Click "Open Other Projects"
   - Navigate to the `stardew-skies-frontend-public` directory
   - Open the project

## 💻 Development

### Project Structure

```
stardew-skies/
├── assets/
│   ├── 0.Fonts/              # Font resources
│   ├── 1.Scene/              # Cocos Creator scenes (NOT in the public repo — see note below)
│   ├── 2.Script/             # TypeScript source code
│   │   ├── Config/           # Config, ENV/deploy settings, operation codes
│   │   ├── Helper/           # Utility functions
│   │   ├── Load/             # Loading / login bootstrap
│   │   ├── Main/             # Main game logic
│   │   ├── Modules/          # Feature modules (Shop, Task, Leaderboard, LuckySpin, …)
│   │   ├── Network/          # Backend API layer (Api service)
│   │   └── Notification/     # Notification system
│   ├── 3.Asset/              # Game assets (sprites, animations)
│   └── Views/                # UI prefabs
├── build/                    # Build output
├── settings/                 # Project settings
└── temp/                     # Temporary build files
```

> **Note:** The scene files (`assets/1.Scene/`) are maintained in a separate
> private repository and are **not** included here. After cloning, Cocos Creator
> will open the project but the `Load` and `Main` scenes will be absent.

### Development Workflow

1. **Make changes** in Cocos Creator or your code editor
2. **Test in browser** using Cocos Creator's built-in preview
3. **Build for production** when ready to deploy

### Key Files

- **[project.json](project.json)** - Cocos Creator project configuration
- **[tsconfig.json](tsconfig.json)** - TypeScript settings for editor IntelliSense (Cocos Creator builds the game itself; the project has no npm dependencies)
- **[assets/2.Script/Network/Api.ts](assets/2.Script/Network/Api.ts)** - Central backend API service
- **[assets/2.Script/Config/Config.ts](assets/2.Script/Config/Config.ts)** - Environment config (`ENV`) and operation codes (`REQUEST_OPERATION`)
- **[PROJECT_DEVELOPMENT_DESCRIPTION.md](PROJECT_DEVELOPMENT_DESCRIPTION.md)** - Detailed development documentation

## 🏗️ Building

### Development Build

1. Open the project in Cocos Creator
2. Go to **Project** → **Build**
3. Select platform: **Web Mobile**
4. Click **Build**
5. Output will be in `build/web-mobile/`

### Production Build

1. Follow development build steps
2. Enable minification and optimization in build settings
3. Deploy the `build/web-mobile/` directory to your web server

### Testing Locally

```bash
# Serve the build directory
cd build/web-mobile
python -m http.server 8000
# or
npx serve
```

Open `http://localhost:8000` in your browser.

## 🔌 API Integration

All backend communication goes through a single centralized service —
[`Network/Api.ts`](assets/2.Script/Network/Api.ts):

- **One operation-routed endpoint.** Every gameplay call is a `POST` to one URL
  with a numeric `operation` code (see `REQUEST_OPERATION` in
  [`Config/Config.ts`](assets/2.Script/Config/Config.ts)) plus that operation's
  params — there are no REST resource URLs.
- **Environment-aware.** The base URL and request timeout come from `ENV` in
  `Config.ts`; it selects local vs. production automatically.
- **Session handling.** The user's `uuid` + access token are attached to every
  request automatically; an HTTP `401` bounces the player back to login.
- **Transport.** `fetch` + `AbortController`, with both `await` and callback
  styles supported.

It backs user authentication (incl. Telegram WebApp), garden persistence, shop
transactions, leaderboard, tasks, and reward distribution.

See [API Operations](PROJECT_DEVELOPMENT_DESCRIPTION.md#api-operations-request_operation) for the operation reference.

## 🎨 Game Modules

| Module | Description |
|--------|-------------|
| **Api** (Network) | Centralized backend API service |
| **Login** | Telegram WebApp / web authentication |
| **MainCtrl** | Core game controller |
| **GardenFloorBuilder** | Multi-floor garden management |
| **FarmingController** | Plant lifecycle and farming mechanics |
| **Shop** | In-game store |
| **Leaderboard** | Player rankings |
| **Task** | Daily tasks and achievements |
| **LuckySpin** | Lucky wheel mini-game |
| **RedeemCode** | Gift code redemption |
| **InventoryBar** | Player inventory management |
| **TutorialDialog** | Tutorial system |

## 📱 Telegram WebApp Integration (Optional)

The game can optionally run as a Telegram Mini App:

1. **Standalone Mode** - Run directly in any web browser
2. **Telegram Mode** - Automatic authentication when launched from Telegram
3. **Deep Linking** - Support for token-based session links

### Setting up Telegram Bot (Optional)

If you want to enable Telegram integration:

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Set up WebApp URL with `/newapp` command
3. Configure your game URL
4. Update server-side authentication to validate Telegram init data

The game works perfectly fine without Telegram integration.

## 🧪 Code Quality

### Architecture & Cleanup (2026-06-25)
- ✅ Extracted a dedicated network layer (`Network/Api.ts`) out of `Helper/Utils`
- ✅ Centralized environment/deploy config in `Config.ts` (`ENV`)
- ✅ Added centralized HTTP 401 → re-login handling
- ✅ Removed npm tooling — the project has no runtime dependencies

### Recent Cleanup (2026-01-29)
- ✅ Removed 3 unused dependencies (~2-3MB reduction)
- ✅ Documentation updated
- 🔄 Ongoing cleanup of orphaned files and dead code

See [Code Health Status](PROJECT_DEVELOPMENT_DESCRIPTION.md#️-code-health-status) for details.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use Cocos Creator component decorators (`@ccclass`, `@property`)
- Keep functions small and focused
- Comment complex logic
- Update [PROJECT_DEVELOPMENT_DESCRIPTION.md](PROJECT_DEVELOPMENT_DESCRIPTION.md) for major changes

## 📄 Documentation

- **[PROJECT_DEVELOPMENT_DESCRIPTION.md](PROJECT_DEVELOPMENT_DESCRIPTION.md)** - Comprehensive project documentation
  - Architecture overview
  - Feature descriptions
  - API operations
  - Code cleanup status
  - Development guidelines

## 🐛 Known Issues

- Traditional username/password login UI is currently disabled (can be re-enabled)
- Referral system: the backend operation exists but no in-game UI is wired yet
- Some legacy commented code pending cleanup

See [Unused/Deprecated Code Analysis](PROJECT_DEVELOPMENT_DESCRIPTION.md#unuseddeprecated-code-analysis) for full list.

## 🗺️ Roadmap

### Planned Features
- [ ] Additional garden floor variations
- [ ] More plant species and crops
- [ ] Seasonal events system
- [ ] Guild/clan features
- [ ] PvP garden competitions
- [ ] Localization/internationalization

### Technical Improvements
- [ ] Unit testing framework
- [ ] CI/CD pipeline
- [ ] Performance optimizations
- [ ] Bundle size reduction
- [ ] Error monitoring integration

## 📞 Support

For issues and questions:
- **Issues:** [GitHub Issues](https://github.com/Pyrotheum1702/stardew-skies-frontend-public/issues)
- **Documentation:** [PROJECT_DEVELOPMENT_DESCRIPTION.md](PROJECT_DEVELOPMENT_DESCRIPTION.md)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Cocos Creator](https://www.cocos.com/en/creator)
- Powered by [Telegram WebApp API](https://core.telegram.org/bots/webapps)

---

**Version:** 1.0.0
**Engine:** Cocos Creator 2.4.13
**Platform:** Web-Mobile (Browser-based, Telegram WebApp compatible)

Made with ❤️ for web gaming community
