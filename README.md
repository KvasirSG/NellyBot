# 🌃 NellyBot - Cyberpunk Discord RPG

A privacy-first cyberpunk Discord bot with immersive character creation, RPG mechanics, and Night City atmosphere. Jack into the matrix, create your digital persona, and climb the corporate ladder through hacking and street smarts.

[![🤖 Bot Functionality Tests](https://github.com/northenfreyja/NellyBot/actions/workflows/bot-tests.yml/badge.svg)](https://github.com/northenfreyja/NellyBot/actions/workflows/bot-tests.yml)
[![🔍 CodeQL Security Analysis](https://github.com/northenfreyja/NellyBot/actions/workflows/codeql.yml/badge.svg)](https://github.com/northenfreyja/NellyBot/actions/workflows/codeql.yml)

![GitHub last commit](https://img.shields.io/github/last-commit/northenfreyja/NellyBot)
![GitHub issues](https://img.shields.io/github/issues/northenfreyja/NellyBot)
![GitHub pull requests](https://img.shields.io/github/issues-pr/northenfreyja/NellyBot)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![Node.js](https://img.shields.io/badge/node.js-16%2B-green)

## 🚀 Key Features

### 🎭 **Privacy-First Character Creation**
- **Complete Privacy Control**: Full GDPR compliance with consent system
- **Street Names**: Custom character names instead of Discord usernames
- **Rich Backgrounds**: 6 unique character origins with bonuses
- **Personal Backstories**: Up to 1000 characters using Discord modals
- **Data Transparency**: View, export, or delete your data anytime

### ⚡ **Advanced RPG Systems**
- **Dynamic Hacking**: Multi-tier difficulty with trace mechanics
- **Character Progression**: Level-based skill caps and balanced growth
- **Interactive UI**: Button-based interfaces and confirmation dialogs
- **Credit Economy**: Earn eddies through various activities
- **Health Management**: Visit ripperdocs for medical services

### 🛡️ **Security & Privacy**
- **No Hardcoded IDs**: Automatic owner detection via Discord API
- **Command Locking**: Character creation required before bot access
- **Data Protection**: Local SQLite storage with user control
- **Privacy Commands**: `/privacy view`, `/privacy export`, `/privacy delete`

### 🎮 **Immersive Experience**
- **Cyberpunk Theming**: Neon colors and Night City atmosphere
- **Rich Storytelling**: Immersive flavor text and world-building
- **Multiple Backgrounds**: Street Kid, Nomad, Corporate, Netrunner, Techie, Solo
- **Character Bonuses**: Starting stats and credits based on background

## 🛠️ Setup

### Prerequisites
- Node.js 16.9.0 or higher
- Discord Application with Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/northenfreyja/NellyBot.git
   cd NellyBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here  # Optional, for faster command deployment
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## 🎮 Commands

### 🎭 **Character & Privacy**
| Command | Description | Access |
|---------|-------------|--------|
| `/jack-in` | Complete character creation with privacy consent | Everyone |
| `/privacy view` | View all your stored data | Everyone |
| `/privacy export` | Export your data in JSON format | Everyone |
| `/privacy delete` | Permanently delete all your data | Everyone |

### 🎮 **Core Gameplay** *(Requires Character Creation)*
| Command | Description | Cooldown |
|---------|-------------|----------|
| `/profile` | View your character stats and backstory | - |
| `/credits` | Check your current eddies balance | - |
| `/hack` | Multi-tier hacking system with difficulty selection | Only on failure* |
| `/heal` | Visit a ripperdoc to restore health using eddies | - |
| `/daily` | Collect daily reward with level bonuses | 24 hours |
| `/upgrade <stat>` | Upgrade cybernetics and skills (with confirmation) | - |
| `/leaderboard` | View top netrunners | - |

### 🛡️ **Admin Commands** *(Owner Only)*
| Command | Description | Access |
|---------|-------------|--------|
| `/admin stats` | View bot statistics and system info | Owner Only |
| `/admin reset-user` | Reset a user's profile data | Owner Only |
| `/admin give-credits` | Give credits to a user | Owner Only |
| `/admin shutdown` | Safely shutdown the bot | Owner Only |

*Hack cooldowns only apply after failed attempts. Successful hacks have no cooldown!*

## 🎭 Character Creation

### Character Backgrounds
Choose from 6 unique backgrounds, each with different starting bonuses:

| Background | Starting Credits | Bonuses | Description |
|------------|-----------------|---------|-------------|
| 🏙️ **Street Kid** | 300 | +5 Street Cred, +2 Combat | Born on the mean streets |
| 🏜️ **Nomad** | 400 | +5 Tech, +2 Combat | Badlands survivor with mechanical skills |
| 🏢 **Corporate** | 800 | +3 Netrunning, +2 Street Cred, +2 Cybernetics | Ex-corpo with inside knowledge |
| 💻 **Netrunner** | 500 | +7 Netrunning | Master of cyberspace |
| 🔧 **Techie** | 600 | +6 Tech, +1 Cybernetics | Machine and gadget expert |
| ⚔️ **Solo** | 450 | +6 Combat, +1 Cybernetics | Professional mercenary |

### Privacy Features
- **Consent Required**: Full privacy disclosure before character creation
- **Data Transparency**: View all stored data with `/privacy view`
- **Data Portability**: Export your data in JSON format
- **Right to Deletion**: Permanently remove all data at any time
- **GDPR Compliant**: Full user control and transparency

## 📊 Character Stats

- **Street Name**: Your custom character name (replaces Discord username)
- **Background**: Your character's origin story and bonuses
- **Backstory**: Personal character history (up to 1000 characters)
- **Level**: Overall progression (affects daily rewards and skill caps)
- **XP**: Experience points for leveling up
- **Credits**: In-game currency (eddies)
- **Health**: Character vitality (can be restored at ripperdocs)
- **Trace Level**: Corporate tracking status (affects hack cooldowns)
- **Cybernetics**: Overall enhancement level
- **Street Cred**: Reputation and access to better content (affects skill caps)
- **Netrunning**: Hacking effectiveness, success rates, and rewards
- **Combat**: Fighting capabilities
- **Tech**: Technical skills and crafting

### Progression System
- **Skill Level Cap**: Each skill is limited by your total level + street cred
- **Background Bonuses**: Starting stats based on your chosen background
- **Hack Success Rate**: Improved by Netrunning skill (+2% per level)
- **Trace System**: Failed hacks increase trace level, extending cooldowns
- **Health System**: Health can be damaged and restored for 10 eddies per point

## 🎯 Hacking System Details

The bot features a sophisticated hacking system with three difficulty tiers:

### Difficulty Levels
- **🟢 Script Kiddie**: 90% base success rate, 50-150 eddies, low trace risk
- **🟡 Corporate Node**: 70% base success rate, 100-300 eddies, medium trace risk
- **🔴 Military ICE**: 50% base success rate, 200-500 eddies, high trace risk

### Success Rate Calculation
- Base success rate varies by difficulty
- +2% per Netrunning skill level
- -5% per current trace level
- Capped between 10% and 95%

### Trace System
- Failed hacks may increase your trace level
- Higher trace levels extend cooldown penalties
- Base cooldown: 1 hour + 30 minutes per trace level
- Successful hacks may occasionally reduce trace level

### Rewards
- Credits scale with difficulty and Netrunning skill
- XP gained from both success and failure
- Street cred chances: 10%/20%/30% based on difficulty
- Reward bonuses: +10% per Netrunning level on success

## 🗂️ Project Structure

```
NellyBot/
├── .github/                    # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates (bug, feature, question)
│   ├── workflows/             # GitHub Actions (CI/CD, security, validation)
│   └── PULL_REQUEST_TEMPLATE.md
├── commands/                   # Slash command files
│   ├── admin.js               # Admin management commands
│   ├── jack-in.js            # Character creation with privacy consent
│   ├── privacy.js            # Privacy data management
│   ├── profile.js            # Enhanced character stats display
│   ├── hack.js               # Advanced hacking system
│   ├── heal.js               # Ripperdoc healing system
│   ├── daily.js              # Daily rewards with bonuses
│   ├── upgrade.js            # Stat upgrades with confirmations
│   ├── credits.js            # Credit balance
│   └── leaderboard.js        # Player rankings
├── events/                    # Event handlers
│   ├── ready.js              # Bot startup and deployment
│   └── interactionCreate.js  # Command, button, modal, select menu handling
├── utils/                     # Utility functions
│   ├── embeds.js             # Cyberpunk-themed embeds
│   ├── privacy.js            # Privacy consent UI components
│   ├── character.js          # Character creation forms and logic
│   ├── commandLock.js        # Command access control
│   └── permissions.js        # Smart ownership detection
├── database.js               # Enhanced SQLite with character & privacy data
├── index.js                  # Main bot file with graceful shutdown
├── CONTRIBUTING.md           # Contribution guidelines
├── CHARACTER_SYSTEM.md       # Character creation documentation
├── OWNERSHIP.md             # Bot ownership system documentation
├── package.json             # Dependencies and scripts
├── .env.example             # Environment template (no hardcoded IDs)
├── .gitignore              # Git ignore patterns
└── README.md               # This file
```

## 🔧 Development

### Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `npm install`
4. **Set up environment**: Copy `.env.example` to `.env` and add your Discord bot token
5. **Read the docs**: Check `CONTRIBUTING.md` for detailed guidelines

### Key Development Notes

- **Privacy First**: All new features must respect user privacy and GDPR compliance
- **Command Locking**: New commands require character creation (add to `UNRESTRICTED_COMMANDS` if needed)
- **Security**: Never log user data, use parameterized queries, validate inputs
- **Testing**: GitHub Actions will validate your code automatically
- **Documentation**: Update README and docs for new features

### Architecture Highlights

- **Modular Design**: Commands, events, and utilities are clearly separated
- **Database Layer**: Clean abstraction with promise-based methods
- **Privacy by Design**: Built-in consent management and data control
- **Interactive UI**: Discord modals, buttons, and select menus
- **Smart Permissions**: Automatic owner detection, no hardcoded IDs

## 🌟 Community & Support

### 🗺️ **Roadmap**
View our development roadmap and planned features:
**https://nellybotdevelopment.featurebase.app/roadmap**

### 💡 **Feature Requests**
Submit feature requests and vote on community ideas:
**https://nellybotdevelopment.featurebase.app**

### 🤝 **Contributing**
We welcome contributions! See our [Contributing Guidelines](CONTRIBUTING.md) for:
- Code style and conventions
- Security and privacy requirements
- Pull request process
- Community guidelines

### 📋 **Issue Reporting**
- 🐛 **Bug Reports**: Use GitHub issues with detailed reproduction steps
- ❓ **Questions**: Use GitHub Discussions for general questions
- 🔒 **Security Issues**: Report privately to maintainers

## 🛡️ **Security & Privacy**

### Privacy Features
- **GDPR Compliant**: Full transparency and user control
- **Data Minimization**: Only collect necessary data for bot functionality
- **User Rights**: View, export, and delete data at any time
- **Consent Based**: Explicit opt-in required for all data processing

### Security Measures
- **Automated Security Scanning**: CodeQL and dependency review
- **Secret Detection**: Prevents token leaks in commits
- **Input Validation**: All user inputs are validated and sanitized
- **Secure Database**: Parameterized queries prevent SQL injection

## 📜 **License**

MIT License - Feel free to modify and distribute!

See [LICENSE](LICENSE) file for details.

---

## 🌃 **Welcome to Night City**

*The future is now, choom. Jack in and make your mark on the digital frontier.*

Ready to contribute? Check out our [Contributing Guidelines](CONTRIBUTING.md) and join the cyberpunk revolution! 🤖✨