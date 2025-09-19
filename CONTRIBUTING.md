# Contributing to NellyBot

Thank you for your interest in contributing to NellyBot! This document provides guidelines and information for contributors.

## 🤖 About NellyBot

NellyBot is a cyberpunk-themed Discord bot with RPG elements, featuring character creation, hacking mechanics, and privacy-first data handling.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Git
- A Discord application/bot token for testing

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/NellyBot.git
   cd NellyBot
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and fill in your Discord bot credentials
5. Start the bot:
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions focused and modular

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(commands): add new daily reward multiplier`
- `fix(privacy): resolve data export formatting issue`
- `docs(readme): update installation instructions`

### Testing

- Test your changes thoroughly in a development Discord server
- Ensure all existing commands still work
- Test privacy features and data handling carefully
- Verify command locking works correctly

## 🛡️ Privacy & Security

### Privacy Guidelines

- **Never log or store sensitive user data** without explicit consent
- Follow GDPR principles: transparency, user control, data minimization
- All new data collection must be clearly disclosed in privacy notices
- Implement data export/deletion for any new user data

### Security Best Practices

- Validate all user inputs
- Use parameterized database queries
- Never expose Discord tokens or API keys
- Implement proper error handling to avoid information leakage

## 🎯 Areas for Contribution

### High Priority

- **New Character Backgrounds**: Add more background types with unique bonuses
- **Mission System**: Implement PvE missions and storylines
- **Guild Features**: Add guild/team functionality
- **Equipment System**: Expand on cybernetic implants and gear

### Medium Priority

- **PvP System**: Player vs player combat mechanics
- **Trading System**: Allow players to trade credits/items
- **Achievement System**: Unlock rewards for milestones
- **Localization**: Add support for multiple languages

### Low Priority

- **Bot Dashboard**: Web interface for server management
- **Advanced Statistics**: Detailed analytics and reporting
- **API Integrations**: Connect with external cyberpunk content
- **Mini-games**: Additional interactive features

## 📝 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test thoroughly** in a development environment

4. **Update documentation** if needed (README, commands, etc.)

5. **Commit your changes** with descriptive commit messages

6. **Push to your fork** and create a pull request

7. **Fill out the PR template** completely

8. **Respond to feedback** and make requested changes

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Changes have been tested
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (unless discussed)
- [ ] Privacy/security considerations addressed
- [ ] Commit messages are descriptive

## 🐛 Bug Reports

When reporting bugs, please include:

- Bot version/commit hash
- Discord.js version
- Node.js version
- Operating system
- Clear steps to reproduce
- Expected vs actual behavior
- Error messages or logs (redacted of sensitive info)

## 💡 Feature Requests

For new features, please provide:

- Clear description of the feature
- Use case and benefits
- Mockups or examples (if applicable)
- Consideration of privacy implications
- Backward compatibility notes

## 📚 Documentation

Help improve documentation by:

- Fixing typos or unclear explanations
- Adding examples for complex features
- Translating documentation
- Creating tutorials or guides

## 🤝 Community Guidelines

### Be Respectful

- Use inclusive language
- Be patient with new contributors
- Provide constructive feedback
- Respect different perspectives and experience levels

### Be Helpful

- Answer questions when you can
- Share knowledge and resources
- Help review pull requests
- Welcome newcomers

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for general questions
- **Discord**: Join our development Discord server (link in README)

## 📜 License

By contributing to NellyBot, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🏆 Recognition

Contributors will be:

- Listed in the repository contributors
- Mentioned in release notes for significant contributions
- Invited to our contributors Discord channel

Thank you for helping make NellyBot better! 🌃✨