const { createCharacterRequiredEmbed } = require('./character');
const { MessageFlags } = require('discord.js');
const logtail = require('./logger');

/**
 * Command locking utility to ensure users have created characters before using commands
 */

// Commands that don't require character creation
const UNRESTRICTED_COMMANDS = [
    'jack-in',
    'privacy',
    'about'
];

/**
 * Check if a user can use a command (requires character creation)
 * @param {Database} db - Database instance
 * @param {Interaction} interaction - Discord interaction
 * @returns {Promise<boolean>} True if user can use the command
 */
async function canUseCommand(db, interaction) {
    const commandName = interaction.commandName;

    // Allow unrestricted commands
    if (UNRESTRICTED_COMMANDS.includes(commandName)) {
        return true;
    }

    try {
        const characterStatus = await db.hasCharacter(interaction.user.id);
        return characterStatus.hasCharacter;
    } catch (error) {
        logtail.error('Error checking character status:', { error: error.message, stack: error.stack, userId: interaction.user.id });
        return false;
    }
}

/**
 * Handle command restriction by replying with character creation prompt
 * @param {Interaction} interaction - Discord interaction
 * @returns {Promise<void>}
 */
async function handleRestrictedCommand(interaction) {
    const embed = createCharacterRequiredEmbed(interaction.commandName);
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

/**
 * Middleware function to check command access
 * @param {Database} db - Database instance
 * @param {Interaction} interaction - Discord interaction
 * @param {Function} next - Function to call if access is granted
 * @returns {Promise<boolean>} True if command was executed, false if blocked
 */
async function checkCommandAccess(db, interaction, next) {
    const hasAccess = await canUseCommand(db, interaction);

    if (!hasAccess) {
        await handleRestrictedCommand(interaction);
        return false;
    }

    await next();
    return true;
}

module.exports = {
    canUseCommand,
    handleRestrictedCommand,
    checkCommandAccess,
    UNRESTRICTED_COMMANDS
};