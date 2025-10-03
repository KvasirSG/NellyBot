const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const { BACKGROUNDS, getBackgroundEmoji } = require('../utils/character');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your cyberpunk character profile and stats'),

    async execute(interaction, db) {
        const user = await db.getUser(interaction.user.id);

        if (!user) {
            const embed = createCyberpunkEmbed(
                'Profile Not Found',
                '🔌 **NEURAL INTERFACE OFFLINE**\n\nYou need to create a character first.\n\nUse `/jack-in` to begin your journey in Night City.',
                colors.warning
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            return;
        }

        const xpToNext = (user.level * 100);
        const progress = Math.min(user.xp / xpToNext * 20, 20);
        const progressBar = '█'.repeat(Math.floor(progress)) + '░'.repeat(20 - Math.floor(progress));

        // Health status
        let healthStatus = '';
        if (user.health <= 20) healthStatus = ' 🩸 (Critical)';
        else if (user.health <= 50) healthStatus = ' ⚠️ (Injured)';

        // Trace status
        let traceStatus = '';
        if (user.trace_level >= 7) traceStatus = ' 🚨 (Hunted)';
        else if (user.trace_level >= 4) traceStatus = ' ⚠️ (Tracked)';
        else if (user.trace_level > 0) traceStatus = ' 👁️ (Monitored)';

        // Calculate skill level cap
        const skillLevelCap = user.level + user.street_cred;

        // Character information
        let characterInfo = '';
        if (user.street_name) {
            characterInfo += `🎭 **Street Name:** ${user.street_name}\n`;
        }
        if (user.background) {
            const backgroundData = BACKGROUNDS[user.background];
            if (backgroundData) {
                characterInfo += `${getBackgroundEmoji(user.background)} **Background:** ${backgroundData.name}\n`;
            }
        }
        // Backstory will be shown via button instead
        if (characterInfo) characterInfo += '\n';

        const displayName = user.street_name || interaction.user.username;

        // Determine profession display
        let profession = 'Netrunner';
        if (user.background) {
            const backgroundData = BACKGROUNDS[user.background];
            if (backgroundData) {
                profession = backgroundData.name;
            }
        }

        const embed = createCyberpunkEmbed(
            `${displayName}'s Neural Profile`,
            characterInfo +
            `**Level ${user.level}** ${profession}\n` +
            `XP: ${user.xp}/${xpToNext}\n[${progressBar}]\n\n` +
            `💰 **Credits:** ${user.credits.toLocaleString()} eddies\n` +
            `❤️ **Health:** ${user.health}/${user.max_health}${healthStatus}\n` +
            `📡 **Trace Level:** ${user.trace_level}/10${traceStatus}\n\n` +
            `**🔧 Cybernetics:** ${user.cybernetics}/${skillLevelCap}\n` +
            `**🌃 Street Cred:** ${user.street_cred}/${skillLevelCap}\n` +
            `**💻 Netrunning:** ${user.netrunning}/${skillLevelCap}\n` +
            `**⚔️ Combat:** ${user.combat}/${skillLevelCap}\n` +
            `**🛠️ Tech:** ${user.tech}/${skillLevelCap}\n\n` +
            `🔒 **Max Skill Level:** ${skillLevelCap} *(Player Level + Street Cred)*\n\n` +
            `**📊 Hack Stats:**\n` +
            `✅ Successful: ${user.successful_hacks || 0}\n` +
            `❌ Failed: ${user.failed_hacks || 0}\n` +
            `🎯 Success Rate: ${user.successful_hacks + user.failed_hacks > 0 ? Math.round((user.successful_hacks / (user.successful_hacks + user.failed_hacks)) * 100) : 0}%`,
            colors.primary
        );

        // Add backstory button if user has one
        const components = [];
        if (user.backstory && user.backstory.trim()) {
            const backstoryButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`view_backstory_${interaction.user.id}`)
                        .setLabel('📖 View Backstory')
                        .setStyle(ButtonStyle.Secondary)
                );
            components.push(backstoryButton);
        }

        await interaction.reply({ embeds: [embed], components });
    }
};