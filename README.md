# 🌱 Sky Garden

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
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pyrotheum1702/sky-garden.git
   cd sky-garden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Open in Cocos Creator**
   - Launch Cocos Creator 2.4.13
   - Click "Open Other Projects"
   - Navigate to the `sky-garden` directory
   - Open the project

## 💻 Development

### Project Structure

```
sky-garden/
├── assets/
│   ├── 0.Fonts/              # Font resources
│   ├── 1.Scene/              # Cocos Creator scenes
│   │   ├── Load.fire         # Loading/Login scene
│   │   └── Main.fire         # Main game scene
│   ├── 2.Script/             # TypeScript source code
│   │   ├── Config/           # Configuration files
│   │   ├── Helper/           # Utility functions
│   │   ├── Main/             # Main game logic
│   │   ├── Modules/          # Feature modules
│   │   ├── Notification/     # Notification system
│   │   └── TelegramWebapp/   # Telegram integration
│   ├── 3.Asset/              # Game assets (sprites, animations)
│   ├── Audio/                # Sound effects and music
│   └── Views/                # UI prefabs
├── build/                    # Build output
├── settings/                 # Project settings
└── temp/                     # Temporary build files
```

### Development Workflow

1. **Make changes** in Cocos Creator or your code editor
2. **Test in browser** using Cocos Creator's built-in preview
3. **Build for production** when ready to deploy

### Key Files

- **[project.json](project.json)** - Cocos Creator project configuration
- **[tsconfig.json](tsconfig.json)** - TypeScript compiler settings
- **[package.json](package.json)** - Node.js dependencies
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

The game communicates with a backend server for:
- User authentication (supports multiple methods including Telegram WebApp)
- Garden state persistence
- Shop transactions
- Leaderboard data
- Task management
- Reward distribution

See [API Operations](PROJECT_DEVELOPMENT_DESCRIPTION.md#api-operations-request_operation) for full API documentation.

## 🎨 Game Modules

| Module | Description |
|--------|-------------|
| **Login** | Telegram WebApp authentication |
| **MainCtrl** | Core game controller |
| **GardenFloorBuilder** | Multi-floor garden management |
| **FarmingController** | Plant lifecycle and farming mechanics |
| **Shop** | In-game store |
| **Leaderboard** | Player rankings |
| **Task** | Daily tasks and achievements |
| **LuckySpin** | Lucky wheel mini-game |
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
- Friend system module exists but not implemented
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
- **Issues:** [GitHub Issues](https://github.com/Pyrotheum1702/sky-garden/issues)
- **Documentation:** [PROJECT_DEVELOPMENT_DESCRIPTION.md](PROJECT_DEVELOPMENT_DESCRIPTION.md)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Cocos Creator](https://www.cocos.com/en/creator)
- Powered by [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- TypeScript support via [@types/node](https://www.npmjs.com/package/@types/node)

---

**Version:** 1.0.0
**Engine:** Cocos Creator 2.4.13
**Platform:** Web-Mobile (Browser-based, Telegram WebApp compatible)

Made with ❤️ for web gaming community
