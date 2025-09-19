const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('./embeds');

/**
 * Privacy and Data Management Utilities
 */

function createPrivacyConsentEmbed() {
    const embed = createCyberpunkEmbed(
        'Data Privacy & Consent',
        `🔒 **NEURAL LINK PRIVACY AGREEMENT**\n\n` +
        `Before jacking into Night City, we need your consent to process and store your data.\n\n` +

        `📊 **What Data We Collect:**\n` +
        `• Discord User ID (for identification)\n` +
        `• Street Name (your chosen character name)\n` +
        `• Character Background & Backstory\n` +
        `• Game progression data (XP, credits, stats)\n` +
        `• Command usage timestamps\n\n` +

        `💾 **How We Store Your Data:**\n` +
        `• Stored locally in an encrypted SQLite database\n` +
        `• No data shared with third parties\n` +
        `• No personal information beyond what you provide\n` +
        `• Data tied only to your Discord User ID\n\n` +

        `🛡️ **Your Rights:**\n` +
        `• View all your stored data anytime (\`/privacy view\`)\n` +
        `• Delete your data completely (\`/privacy delete\`)\n` +
        `• Modify your character information (\`/privacy edit\`)\n` +
        `• Withdraw consent and stop using the bot\n\n` +

        `⚖️ **Legal Basis:**\n` +
        `• Data processing based on your explicit consent\n` +
        `• You can withdraw consent at any time\n` +
        `• Data necessary for bot functionality only\n\n` +

        `🗑️ **Data Deletion:**\n` +
        `• Use \`/privacy delete\` to remove all your data\n` +
        `• Account automatically deleted after 1 year of inactivity\n` +
        `• All backups purged within 30 days of deletion\n\n` +

        `**Do you consent to this data processing?**`,
        colors.info
    );

    return embed;
}

function createPrivacyConsentButtons(userId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`privacy_accept_${userId}`)
                .setLabel('🟢 Accept & Create Character')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`privacy_decline_${userId}`)
                .setLabel('🔴 Decline')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`privacy_info_${userId}`)
                .setLabel('📋 More Info')
                .setStyle(ButtonStyle.Secondary)
        );
}

function createPrivacyInfoEmbed() {
    const embed = createCyberpunkEmbed(
        'Detailed Privacy Information',
        `🔍 **TECHNICAL DETAILS**\n\n` +

        `**Data Controller:** Bot Owner/Server Administrator\n` +
        `**Data Location:** Local server storage\n` +
        `**Encryption:** AES-256 for sensitive data\n` +
        `**Access:** Only automated bot processes\n\n` +

        `📋 **Complete Data List:**\n` +
        `\`\`\`\n` +
        `• user_id: Your Discord ID\n` +
        `• street_name: Character name you choose\n` +
        `• background: Character background type\n` +
        `• backstory: Your character's story\n` +
        `• level, xp, credits: Game progression\n` +
        `• stats: cybernetics, street_cred, etc.\n` +
        `• timestamps: last_daily, last_hack, etc.\n` +
        `• privacy_accepted: Consent timestamp\n` +
        `• created_at: Account creation date\n` +
        `\`\`\`\n\n` +

        `🔄 **Data Processing Purposes:**\n` +
        `• Character progression tracking\n` +
        `• Game state management\n` +
        `• Cooldown enforcement\n` +
        `• Leaderboard generation\n` +
        `• Command personalization\n\n` +

        `📞 **Contact:**\n` +
        `For privacy concerns or data requests, contact the server administrator.\n\n` +

        `⏰ **This consent is valid until withdrawn.**`,
        colors.info
    );

    return embed;
}

function createCharacterCreationEmbed() {
    const embed = createCyberpunkEmbed(
        'Welcome to Night City',
        `🌃 **NEURAL INTERFACE ACTIVATED**\n\n` +
        `Thank you for accepting our privacy terms, choom.\n\n` +
        `Time to create your digital persona for the streets of Night City. ` +
        `Click the button below to open the character creation interface.\n\n` +
        `⚡ **You'll be able to set:**\n` +
        `• Your Street Name (how others see you)\n` +
        `• Character Background (affects starting bonuses)\n` +
        `• Personal Backstory (your character's history)\n\n` +
        `*Ready to jack in, netrunner?*`,
        colors.primary
    );

    return embed;
}

function createCharacterCreationButton(userId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`create_character_${userId}`)
                .setLabel('🎭 Create Character')
                .setStyle(ButtonStyle.Primary)
        );
}

function createPrivacyDeclinedEmbed() {
    const embed = createCyberpunkEmbed(
        'Neural Link Terminated',
        `🔌 **CONNECTION SEVERED**\n\n` +
        `You've chosen not to consent to data processing.\n\n` +
        `Without this consent, we cannot:\n` +
        `• Store your character data\n` +
        `• Track your progress\n` +
        `• Enable bot commands\n\n` +
        `**You can restart this process anytime by using \`/jack-in\` again.**\n\n` +
        `Stay safe out there, potential netrunner.`,
        colors.warning
    );

    return embed;
}

module.exports = {
    createPrivacyConsentEmbed,
    createPrivacyConsentButtons,
    createPrivacyInfoEmbed,
    createCharacterCreationEmbed,
    createCharacterCreationButton,
    createPrivacyDeclinedEmbed
};