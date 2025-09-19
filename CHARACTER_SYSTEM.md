# Character Creation & Privacy System

## Overview

The bot now features a comprehensive character creation system with privacy protection and command locking. Users must create a character profile before accessing any bot commands (except `/jack-in` and `/privacy`).

## User Journey

### 1. Privacy Consent (`/jack-in`)
- **First-time users** see a detailed privacy notice explaining data collection and storage
- Users can view more details or accept/decline consent
- **Declining** prevents bot usage but allows restart anytime
- **Accepting** creates a user record and proceeds to character creation

### 2. Character Creation
- **Street Name**: Custom character name (2-32 characters)
- **Backstory**: Optional character background story (up to 1000 characters)
- **Background Selection**: Choose from 6 character backgrounds with unique bonuses

### 3. Background Types

| Background | Starting Credits | Bonuses | Description |
|------------|-----------------|---------|-------------|
| **🏙️ Street Kid** | 300 | +5 Street Cred, +2 Combat | Born on the mean streets |
| **🏜️ Nomad** | 400 | +5 Tech, +2 Combat | Badlands survivor with mechanical skills |
| **🏢 Corporate** | 800 | +3 Netrunning, +2 Street Cred, +2 Cybernetics | Ex-corpo with inside knowledge |
| **💻 Netrunner** | 500 | +7 Netrunning | Master of cyberspace |
| **🔧 Techie** | 600 | +6 Tech, +1 Cybernetics | Machine and gadget expert |
| **⚔️ Solo** | 450 | +6 Combat, +1 Cybernetics | Professional mercenary |

## Command Locking System

### Restricted Commands
All commands except `/jack-in` and `/privacy` require character creation:
- `/profile`, `/daily`, `/hack`, `/heal`, `/upgrade`, `/credits`, `/leaderboard`, `/admin`

### Access Control
- **Before character creation**: Users get a prompt to use `/jack-in`
- **After character creation**: Full access to all bot features
- **Privacy commands**: Always accessible for data management

## Privacy Features

### Data Transparency (`/privacy view`)
Shows all stored user data including:
- Character information (street name, background, backstory)
- Game progression (level, XP, credits, stats)
- Activity timestamps
- Privacy consent date

### Data Portability (`/privacy export`)
- Exports user data in JSON format
- Excludes sensitive internal identifiers
- Handles large exports gracefully

### Right to Deletion (`/privacy delete`)
- **Complete data removal** from all database tables
- **Immediate effect** - requires new `/jack-in` to use bot again
- **Logged action** for audit purposes

## Technical Implementation

### Database Schema Updates
```sql
-- New character fields
street_name TEXT,
background TEXT,
backstory TEXT,
privacy_accepted DATETIME,
character_created BOOLEAN DEFAULT FALSE
```

### Component Files

| File | Purpose |
|------|---------|
| `utils/privacy.js` | Privacy consent UI components |
| `utils/character.js` | Character creation modals and logic |
| `utils/commandLock.js` | Command access control middleware |
| `commands/privacy.js` | Privacy management commands |
| `commands/jack-in.js` | Updated character creation flow |

### Interaction Handling
- **Button interactions**: Privacy consent, character creation start
- **Modal submissions**: Street name and backstory input
- **Select menus**: Background selection
- **User verification**: All interactions verify user identity

## Security & Privacy

### Data Protection
- **Local storage**: SQLite database on server
- **No third-party sharing**: Data stays within the bot system
- **User control**: Full transparency and deletion rights
- **Consent-based**: Explicit opt-in required

### Content Filtering
- **Street name validation**: Length limits and inappropriate content filtering
- **Backstory limits**: 1000 character maximum
- **User verification**: All interactions tied to specific users

### Privacy Compliance
- **Clear disclosure**: Detailed explanation of data collection
- **User rights**: View, export, and delete data anytime
- **Consent withdrawal**: Users can delete data and stop using bot
- **Audit logging**: Data deletion events are logged

## User Benefits

### Enhanced Experience
- **Personalized interactions**: Bot uses character's street name
- **Rich character profiles**: Background affects starting stats
- **Narrative immersion**: Custom backstories add roleplay depth
- **Progress protection**: Character creation ensures data investment

### Privacy Assurance
- **Informed consent**: Users know exactly what data is collected
- **Control**: Full power to view, export, or delete data
- **Transparency**: Complete visibility into data usage
- **Trust**: Clear privacy policies and user rights

## Commands Reference

### `/jack-in`
- Starts character creation process
- Shows privacy consent for new users
- Returns to character creation if consent given but character incomplete
- Shows status for existing characters

### `/privacy view`
- Displays all stored user data
- Shows privacy consent date
- Lists all character and game progression data

### `/privacy export`
- Exports user data in JSON format
- Handles large datasets gracefully
- Excludes sensitive internal identifiers

### `/privacy delete`
- Permanently deletes all user data
- Requires new character creation to use bot again
- Action is logged for audit purposes

### `/profile`
- Enhanced with character information
- Shows street name, background, and backstory
- Maintains all original game statistics
- Uses character name in title when available