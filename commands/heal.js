const { SlashCommandBuilder } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heal')
        .setDescription('Visit a ripperdoc to restore your health'),

    async execute(interaction, db) {
        let user = await db.getUser(interaction.user.id);

        if (!user) {
            await db.createUser(interaction.user.id, interaction.user.username);
            user = await db.getUser(interaction.user.id);
        }

        if (user.health >= user.max_health) {
            const embed = createCyberpunkEmbed(
                'Full Health',
                `❤️ Your health is already at maximum (${user.health}/${user.max_health}).\n\nNo need for a ripperdoc visit, choom.`,
                colors.info
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const healthMissing = user.max_health - user.health;
        const healingCost = healthMissing * 10; // 10 eddies per health point

        if (user.credits < healingCost) {
            const embed = createCyberpunkEmbed(
                'Insufficient Funds',
                `💸 The ripperdoc wants **${healingCost}** eddies to patch you up.\n\n` +
                `Health needed: ${healthMissing} points\n` +
                `Your balance: **${user.credits}** eddies\n\n` +
                `"No eddies, no healing, choom."`,
                colors.danger
            );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // Heal the user
        await db.updateUser(interaction.user.id, {
            health: user.max_health,
            credits: user.credits - healingCost
        });

        const healingFlavor = [
            "The ripperdoc patches your neural pathways.",
            "Synthetic blood flows through fresh IV lines.",
            "Your cortex tingles as damaged neurons regenerate.",
            "Nanobots repair cellular damage throughout your system.",
            "The doc's chrome hands work with precision on your wounds.",
            "Neural stimulants flood your system, restoring vitality."
        ];

        const randomFlavor = healingFlavor[Math.floor(Math.random() * healingFlavor.length)];

        const embed = createCyberpunkEmbed(
            'Ripperdoc Visit Complete',
            `🏥 **MEDICAL PROCEDURE SUCCESSFUL**\n\n` +
            `❤️ **Health Restored**: ${user.health} → ${user.max_health}\n` +
            `💰 **Cost**: ${healingCost} eddies\n` +
            `💳 **Remaining Credits**: ${user.credits - healingCost} eddies\n\n` +
            `💉 ${randomFlavor}\n\n` +
            `*"You're patched up good as new. Try not to jack into any black ICE for a while."*`,
            colors.primary
        );

        await interaction.reply({ embeds: [embed] });
    }
};