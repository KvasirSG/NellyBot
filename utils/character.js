const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('./embeds');

/**
 * Character Creation Utilities
 */

const BACKGROUNDS = {
    'street_kid': {
        name: 'Street Kid',
        description: 'Born and raised on the mean streets. You know the underbelly of Night City like the back of your hand.',
        bonuses: { street_cred: 5, combat: 2 },
        startingCredits: 300
    },
    'nomad': {
        name: 'Nomad',
        description: 'From the Badlands outside the city. You have survival skills and mechanical knowledge.',
        bonuses: { tech: 5, combat: 2 },
        startingCredits: 400
    },
    'corpo': {
        name: 'Corporate',
        description: 'Former corporate drone with inside knowledge of how the big companies operate.',
        bonuses: { netrunning: 3, street_cred: 2, cybernetics: 2 },
        startingCredits: 800
    },
    'netrunner': {
        name: 'Netrunner',
        description: 'Skilled hacker who lives in cyberspace. The net is your domain.',
        bonuses: { netrunning: 7 },
        startingCredits: 500
    },
    'techie': {
        name: 'Techie',
        description: 'Master of machines and gadgets. You can fix, hack, or build almost anything.',
        bonuses: { tech: 6, cybernetics: 1 },
        startingCredits: 600
    },
    'solo': {
        name: 'Solo',
        description: 'Professional mercenary and gun-for-hire. Combat is your specialty.',
        bonuses: { combat: 6, cybernetics: 1 },
        startingCredits: 450
    }
};

function createCharacterModal(userId) {
    const modal = new ModalBuilder()
        .setCustomId(`character_creation_${userId}`)
        .setTitle('🎭 Neural Profile Creation');

    const streetNameInput = new TextInputBuilder()
        .setCustomId('street_name')
        .setLabel('Street Name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('What do they call you on the street?')
        .setRequired(true)
        .setMaxLength(32)
        .setMinLength(2);

    const backstoryInput = new TextInputBuilder()
        .setCustomId('backstory')
        .setLabel('Character Backstory')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Tell us your character\'s story... (optional)')
        .setRequired(false)
        .setMaxLength(1000);

    const streetNameRow = new ActionRowBuilder().addComponents(streetNameInput);
    const backstoryRow = new ActionRowBuilder().addComponents(backstoryInput);

    modal.addComponents(streetNameRow, backstoryRow);

    return modal;
}

function createBackgroundSelectEmbed() {
    const embed = createCyberpunkEmbed(
        'Choose Your Background',
        `🌃 **SELECT YOUR ORIGIN STORY**\n\n` +
        `Your background determines your character's history and starting bonuses. Choose wisely, choom.\n\n` +
        `📋 **Available Backgrounds:**\n\n` +
        Object.entries(BACKGROUNDS).map(([key, bg]) =>
            `**${bg.name}**\n` +
            `${bg.description}\n` +
            `💰 Starting Credits: ${bg.startingCredits}\n` +
            `📈 Bonuses: ${Object.entries(bg.bonuses).map(([stat, bonus]) => `+${bonus} ${stat.replace('_', ' ')}`).join(', ')}\n`
        ).join('\n'),
        colors.primary
    );

    return embed;
}

function createBackgroundSelectMenu(userId) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`background_select_${userId}`)
        .setPlaceholder('🎭 Choose your character background...')
        .addOptions(
            Object.entries(BACKGROUNDS).map(([key, bg]) => ({
                label: bg.name,
                description: bg.description.slice(0, 100),
                value: key,
                emoji: getBackgroundEmoji(key)
            }))
        );

    return new ActionRowBuilder().addComponents(selectMenu);
}

function getBackgroundEmoji(background) {
    const emojis = {
        'street_kid': '🏙️',
        'nomad': '🏜️',
        'corpo': '🏢',
        'netrunner': '💻',
        'techie': '🔧',
        'solo': '⚔️'
    };
    return emojis[background] || '🎭';
}

function createCharacterCompleteEmbed(streetName, background, backstory, bonuses, startingCredits) {
    const backgroundInfo = BACKGROUNDS[background];

    const embed = createCyberpunkEmbed(
        'Character Creation Complete',
        `🎉 **NEURAL PROFILE UPLOADED SUCCESSFULLY**\n\n` +
        `**Street Name:** ${streetName}\n` +
        `**Background:** ${getBackgroundEmoji(background)} ${backgroundInfo.name}\n\n` +
        `📊 **Starting Bonuses Applied:**\n` +
        Object.entries(bonuses).map(([stat, bonus]) =>
            `• +${bonus} ${stat.replace('_', ' ').toUpperCase()}`
        ).join('\n') + '\n\n' +
        `💰 **Starting Credits:** ${startingCredits} eddies\n\n` +
        (backstory ? `📖 **Your Story:**\n*"${backstory}"*\n\n` : '') +
        `🌟 **Welcome to Night City, ${streetName}!**\n` +
        `Your neural interface is now active. All bot commands are unlocked and ready to use.\n\n` +
        `Type \`/profile\` to view your complete character sheet.`,
        colors.success
    );

    return embed;
}

function createCharacterRequiredEmbed(commandName) {
    const embed = createCyberpunkEmbed(
        'Neural Interface Offline',
        `🔌 **CONNECTION REQUIRED**\n\n` +
        `You must create a character profile before using \`/${commandName}\`.\n\n` +
        `**To get started:**\n` +
        `1. Use \`/jack-in\` to begin character creation\n` +
        `2. Accept the privacy terms\n` +
        `3. Create your character profile\n\n` +
        `*The streets of Night City await, potential netrunner...*`,
        colors.warning
    );

    return embed;
}

function applyBackgroundBonuses(background) {
    const backgroundData = BACKGROUNDS[background];
    if (!backgroundData) return { bonuses: {}, startingCredits: 500 };

    return {
        bonuses: backgroundData.bonuses,
        startingCredits: backgroundData.startingCredits
    };
}

module.exports = {
    BACKGROUNDS,
    createCharacterModal,
    createBackgroundSelectEmbed,
    createBackgroundSelectMenu,
    createCharacterCompleteEmbed,
    createCharacterRequiredEmbed,
    applyBackgroundBonuses,
    getBackgroundEmoji
};