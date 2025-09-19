const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const {
    createPrivacyConsentEmbed,
    createPrivacyConsentButtons,
    createCharacterCreationEmbed,
    createCharacterCreationButton
} = require('../utils/privacy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jack-in')
        .setDescription('Initialize your cyberpunk character profile and neural interface'),

    async execute(interaction, db) {
        try {
            const characterStatus = await db.hasCharacter(interaction.user.id);

            // If user already has a complete character
            if (characterStatus.hasCharacter) {
                const user = await db.getUser(interaction.user.id);
                const embed = createCyberpunkEmbed(
                    'Neural Interface Active',
                    `🌃 **Welcome back, ${user.street_name || interaction.user.username}!**\n\n` +
                    `Your neural interface is already connected to Night City's grid.\n\n` +
                    `**Current Status:**\n` +
                    `💰 Credits: ${user.credits.toLocaleString()} eddies\n` +
                    `⭐ Level: ${user.level}\n` +
                    `🌃 Street Cred: ${user.street_cred}\n\n` +
                    `Type \`/profile\` to view your complete character sheet.`,
                    colors.info
                );
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                return;
            }

            // If user has privacy consent but no character
            if (characterStatus.hasPrivacyConsent) {
                const embed = createCharacterCreationEmbed();
                const button = createCharacterCreationButton(interaction.user.id);
                await interaction.reply({ embeds: [embed], components: [button], flags: MessageFlags.Ephemeral });
                return;
            }

            // First time user - show privacy consent
            const embed = createPrivacyConsentEmbed();
            const buttons = createPrivacyConsentButtons(interaction.user.id);
            await interaction.reply({ embeds: [embed], components: [buttons], flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error('Error in jack-in command:', error);
            const embed = createCyberpunkEmbed(
                'Neural Interface Error',
                '⚠️ **CONNECTION FAILED**\n\nThere was an error initializing your neural interface. Please try again.',
                colors.danger
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};