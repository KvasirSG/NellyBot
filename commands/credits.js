const { SlashCommandBuilder } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Check your current eddies (credits) balance'),

    async execute(interaction, db) {
        let user = await db.getUser(interaction.user.id);

        if (!user) {
            await db.createUser(interaction.user.id, interaction.user.username);
            user = await db.getUser(interaction.user.id);
        }

        // Calculate skill level cap and next upgrade costs
        const skillLevelCap = user.level + user.street_cred;
        const skills = ['cybernetics', 'street_cred', 'netrunning', 'combat', 'tech'];
        const skillNames = {
            cybernetics: '🔧 Cybernetics',
            street_cred: '🌃 Street Cred',
            netrunning: '💻 Netrunning',
            combat: '⚔️ Combat',
            tech: '🛠️ Tech'
        };

        let upgradeInfo = '';
        let totalUpgradeCost = 0;
        let availableUpgrades = 0;

        skills.forEach(skill => {
            const currentLevel = user[skill] || 0;
            const cost = (currentLevel + 1) * 100;
            const canUpgrade = currentLevel < skillLevelCap && user.credits >= cost;

            if (currentLevel < skillLevelCap) {
                availableUpgrades++;
                totalUpgradeCost += cost;
                const status = user.credits >= cost ? '✅' : '❌';
                upgradeInfo += `${status} ${skillNames[skill]}: ${cost} eddies (${currentLevel}→${currentLevel + 1})\n`;
            }
        });

        let description = `💰 **${user.credits.toLocaleString()}** eddies\n\n`;

        if (availableUpgrades > 0) {
            description += `🔧 **Available Upgrades:**\n${upgradeInfo}\n`;
            description += `💸 **Total Cost for All:** ${totalUpgradeCost.toLocaleString()} eddies\n\n`;
        }

        description += `🔒 **Skill Level Cap:** ${skillLevelCap} *(Level ${user.level} + Street Cred ${user.street_cred})*\n\n`;

        if (availableUpgrades === 0) {
            if (skillLevelCap === 0) {
                description += `⚠️ **No upgrades available** - Increase your player level or street cred first!\n\n`;
            } else {
                description += `🎉 **All skills maxed out** for your current level cap!\n\n`;
            }
        }

        description += `💡 **Ways to earn more:**\n` +
            `• \`/hack\` - Netrun for quick eddies & XP\n` +
            `• \`/daily\` - Corporate stipend (24h cooldown)\n` +
            `• \`/mission\` - Complete jobs for big payouts\n` +
            `• Level up to increase skill caps!`;

        const embed = createCyberpunkEmbed(
            'Credit Balance & Upgrades',
            description,
            colors.primary
        );

        await interaction.reply({ embeds: [embed] });
    }
};