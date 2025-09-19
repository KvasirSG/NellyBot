const { SlashCommandBuilder } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily eddies reward'),

    async execute(interaction, db) {
        let user = await db.getUser(interaction.user.id);

        if (!user) {
            await db.createUser(interaction.user.id, interaction.user.username);
            user = await db.getUser(interaction.user.id);
        }

        const now = new Date();
        const lastDaily = user.last_daily ? new Date(user.last_daily) : null;
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

        if (lastDaily && lastDaily > oneDayAgo) {
            const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - lastDaily)) / (60 * 60 * 1000));
            const embed = createCyberpunkEmbed(
                'Daily Already Collected',
                `⏰ Come back in **${timeLeft} hours** for your next daily reward.`,
                colors.warning
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const baseReward = 100;
        const levelBonus = user.level * 25;
        const streetCredBonus = user.street_cred * 5;
        const totalReward = baseReward + levelBonus + streetCredBonus;
        const xpGain = 25;

        // Street cred gain chance (15% base chance, +2% per 5 levels)
        const streetCredChance = 0.15 + (Math.floor(user.level / 5) * 0.02);
        const streetCredGain = Math.random() < streetCredChance ? 1 : 0;

        const newLevel = Math.floor((user.xp + xpGain) / 100) + 1;
        const leveledUp = newLevel > user.level;

        await db.updateUser(interaction.user.id, {
            credits: user.credits + totalReward,
            xp: user.xp + xpGain,
            level: newLevel,
            street_cred: user.street_cred + streetCredGain,
            last_daily: now.toISOString()
        });

        let description = `🎁 **CORPORATE STIPEND RECEIVED**\n\n` +
            `💰 Base reward: **${baseReward}** eddies\n` +
            `⭐ Level bonus: **${levelBonus}** eddies\n` +
            `🌃 Street cred bonus: **${streetCredBonus}** eddies\n` +
            `**Total: ${totalReward} eddies**\n\n` +
            `⭐ XP: **+${xpGain}**\n`;

        if (streetCredGain > 0) {
            description += `🌃 Street Cred: **+${streetCredGain}** (${user.street_cred} → ${user.street_cred + streetCredGain})\n`;
        }

        description += `\nAnother day surviving in Night City pays off!`;

        if (leveledUp) {
            description += `\n\n🎉 **LEVEL UP!** You are now level **${newLevel}**!`;
        }

        const embed = createCyberpunkEmbed('Daily Reward Collected', description, colors.primary);
        await interaction.reply({ embeds: [embed] });
    }
};