const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgrade')
        .setDescription('Upgrade your cybernetics and skills')
        .addStringOption(option =>
            option.setName('stat')
                .setDescription('Choose stat to upgrade')
                .setRequired(true)
                .addChoices(
                    { name: '🔧 Cybernetics', value: 'cybernetics' },
                    { name: '🌃 Street Cred', value: 'street_cred' },
                    { name: '💻 Netrunning', value: 'netrunning' },
                    { name: '⚔️ Combat', value: 'combat' },
                    { name: '🛠️ Tech', value: 'tech' }
                )),

    async execute(interaction, db) {
        const stat = interaction.options.getString('stat');
        let user = await db.getUser(interaction.user.id);

        if (!user) {
            await db.createUser(interaction.user.id, interaction.user.username);
            user = await db.getUser(interaction.user.id);
        }

        const currentLevel = user[stat] || 0;
        const cost = (currentLevel + 1) * 100;

        const statNames = {
            cybernetics: '🔧 Cybernetics',
            street_cred: '🌃 Street Cred',
            netrunning: '💻 Netrunning',
            combat: '⚔️ Combat',
            tech: '🛠️ Tech'
        };

        const statDescriptions = {
            cybernetics: 'Increases overall effectiveness and unlocks advanced features',
            street_cred: 'Opens up better missions and black market access',
            netrunning: 'Improves hacking rewards and success rates',
            combat: 'Better performance in combat missions and PvP',
            tech: 'Crafting bonuses and equipment effectiveness'
        };

        // Calculate skill level cap based on player level and street cred
        const skillLevelCap = user.level + user.street_cred;
        const newSkillLevel = currentLevel + 1;

        // Check if upgrade would exceed the skill level cap
        if (newSkillLevel > skillLevelCap) {
            const embed = createCyberpunkEmbed(
                'Skill Level Locked',
                `🔒 **Upgrade Blocked**\n\n` +
                `Your **${statNames[stat]}** cannot exceed level **${skillLevelCap}**.\n\n` +
                `**Current Requirements:**\n` +
                `• Player Level: **${user.level}**\n` +
                `• Street Cred: **${user.street_cred}**\n` +
                `• Maximum Skill Level: **${skillLevelCap}**\n\n` +
                `💡 *Gain more XP or Street Cred to unlock higher skill levels!*`,
                colors.warning
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (user.credits < cost) {
            const embed = createCyberpunkEmbed(
                'Insufficient Funds',
                `💸 You need **${cost}** eddies to upgrade **${stat}**.\nCurrent balance: **${user.credits}** eddies`,
                colors.danger
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // Create confirmation embed
        const confirmEmbed = createCyberpunkEmbed(
            'Confirm Upgrade',
            `⚠️ **Upgrade Confirmation**\n\n` +
            `**Stat:** ${statNames[stat]}\n` +
            `**Current Level:** ${currentLevel}\n` +
            `**New Level:** ${currentLevel + 1}\n` +
            `**Max Allowed Level:** ${skillLevelCap}\n` +
            `**Cost:** ${cost} eddies\n` +
            `**Remaining Credits:** ${user.credits - cost} eddies\n\n` +
            `*${statDescriptions[stat]}*\n\n` +
            `Are you sure you want to proceed with this upgrade?`,
            colors.warning
        );

        // Create buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId(`upgrade_confirm_${stat}_${interaction.user.id}`)
            .setLabel('✅ Confirm Upgrade')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId(`upgrade_cancel_${interaction.user.id}`)
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};