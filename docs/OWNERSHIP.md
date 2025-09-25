# Bot Ownership System

The bot now uses an improved ownership system that automatically detects bot owners and team members without requiring hardcoded user IDs.

## How It Works

### Owner Detection
- **Individual Owner**: If the bot application has a single owner, that user is automatically detected as the owner
- **Team Owner**: If the bot belongs to a Discord team, all team members are automatically recognized as owners

### Permission Levels

1. **Bot Owner/Team Members** (`isStrictOwner`)
   - Can use all admin commands including shutdown
   - Automatically detected via Discord API

2. **Guild Administrators** (`isGuildAdmin`)
   - Server admins can use most admin commands (except shutdown)
   - Based on Discord's Administrator permission

3. **Regular Users**
   - Can use all normal bot commands
   - Cannot access admin functionality

## Available Admin Commands

Use `/admin <subcommand>` to access admin functionality:

- **`/admin stats`** - View bot statistics and system info
- **`/admin reset-user <user>`** - Reset a user's profile data
- **`/admin give-credits <user> <amount>`** - Give credits to a user
- **`/admin shutdown`** - [Owner Only] Safely shutdown the bot

## Migration from BOT_OWNER_ID

The old `BOT_OWNER_ID` environment variable is no longer needed and has been removed. The bot now:

- Uses Discord's application API to detect owners automatically
- Supports both individual owners and team ownership
- Provides better security by not relying on hardcoded IDs

## Benefits

- **No hardcoded IDs**: More secure and maintainable
- **Team Support**: Works with Discord teams out of the box
- **Automatic Detection**: No manual configuration needed
- **Guild-based Permissions**: Server admins can help manage the bot
- **Scalable**: Works across multiple servers without configuration