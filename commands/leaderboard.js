const { SlashCommandBuilder } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top netrunners by level'),

    async execute(interaction, db) {
        const topUsers = await db.getTopUsers(10);

        if (!topUsers || topUsers.length === 0) {
            const embed = createCyberpunkEmbed(
                'Night City Leaderboard',
                '🏆 No netrunners found in the database yet.\n\nUse `/jack-in` to become the first!',
                colors.info
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const leaderboardText = topUsers
            .map((user, index) => {
                const position = index + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
                return `${medal} **${user.username}** - Level ${user.level} (${user.xp} XP)`;
            })
            .join('\n');

        const embed = createCyberpunkEmbed(
            'Night City Leaderboard',
            `🏆 **Top Netrunners**\n\n${leaderboardText}\n\n` +
            `*Rankings based on level and experience points*`,
            colors.info
        );

        await interaction.reply({ embeds: [embed] });
    }
};