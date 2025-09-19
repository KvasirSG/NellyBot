const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('Hack for credits - only failures trigger cooldowns!'),

    async execute(interaction, db) {
        let user = await db.getUser(interaction.user.id);

        if (!user) {
            await db.createUser(interaction.user.id, interaction.user.username);
            user = await db.getUser(interaction.user.id);
        }

        const now = new Date();
        const lastFailedHack = user.last_failed_hack ? new Date(user.last_failed_hack) : null;

        // Only check cooldown if there was a recent failure
        if (lastFailedHack) {
            // Base cooldown for failures: 1 hour + trace penalties
            const baseCooldown = 60 * 60 * 1000; // 1 hour
            const tracePenalty = user.trace_level * 30 * 60 * 1000; // +30 min per trace level
            const totalCooldown = baseCooldown + tracePenalty;

            if ((now - lastFailedHack) < totalCooldown) {
                const timeLeft = Math.ceil((totalCooldown - (now - lastFailedHack)) / (60 * 1000)); // Show in minutes
                const embed = createCyberpunkEmbed(
                    'Neural Recovery Mode',
                    `🧠 Your neural pathways are still recovering from your last failed hack.\n\n` +
                    `Cooldown: **${timeLeft} minutes** remaining\n` +
                    `${user.trace_level > 0 ? `⚠️ **Trace Level ${user.trace_level}**: Corporate ICE is still hunting you!` : ''}\n\n` +
                    `💡 *Successful hacks don't trigger cooldowns - only failures do!*`,
                    colors.warning
                );
                await interaction.reply({ embeds: [embed] });
                return;
            }
        }

        // Show difficulty selection
        const embed = createCyberpunkEmbed(
            'Select Hack Difficulty',
            `🎯 **Choose your target, netrunner**\n\n` +
            `Your Netrunning Skill: **${user.netrunning}**\n` +
            `Current Trace Level: **${user.trace_level}**\n` +
            `Failed Hacks: **${user.failed_hacks}** | Successful: **${user.successful_hacks}**\n\n` +
            `Select difficulty level below:`,
            colors.info
        );

        const difficulties = [
            {
                name: '🟢 Script Kiddie',
                id: 'easy',
                description: 'Low-security targets\n• 90% base success rate\n• 50-150 eddies\n• 10% street cred chance\n• Low trace risk',
                style: ButtonStyle.Success
            },
            {
                name: '🟡 Corporate Node',
                id: 'medium',
                description: 'Medium-security targets\n• 70% base success rate\n• 100-300 eddies\n• 20% street cred chance\n• Medium trace risk',
                style: ButtonStyle.Primary
            },
            {
                name: '🔴 Military ICE',
                id: 'hard',
                description: 'High-security targets\n• 50% base success rate\n• 200-500 eddies\n• 30% street cred chance\n• High trace risk',
                style: ButtonStyle.Danger
            }
        ];

        const buttons = difficulties.map(diff =>
            new ButtonBuilder()
                .setCustomId(`hack_${diff.id}_${interaction.user.id}`)
                .setLabel(diff.name)
                .setStyle(diff.style)
        );

        const row = new ActionRowBuilder().addComponents(buttons);

        // Add info button
        const infoButton = new ButtonBuilder()
            .setCustomId(`hack_info_${interaction.user.id}`)
            .setLabel('ℹ️ Hacking Info')
            .setStyle(ButtonStyle.Secondary);

        const infoRow = new ActionRowBuilder().addComponents(infoButton);

        await interaction.reply({
            embeds: [embed],
            components: [row, infoRow],
            flags: MessageFlags.Ephemeral
        });
    }
};

// Hack calculation functions
function calculateSuccessRate(userNetrunning, difficulty, traceLevel) {
    const baseSR = {
        easy: 90,
        medium: 70,
        hard: 50
    };

    let successRate = baseSR[difficulty];

    // Netrunning skill bonus: +2% per level
    successRate += (userNetrunning * 2);

    // Trace level penalty: -5% per trace level
    successRate -= (traceLevel * 5);

    // Cap between 10% and 95%
    return Math.max(10, Math.min(95, successRate));
}

function calculateRewards(difficulty, userNetrunning, isSuccess) {
    const baseRewards = {
        easy: { min: 50, max: 150 },
        medium: { min: 100, max: 300 },
        hard: { min: 200, max: 500 }
    };

    const base = baseRewards[difficulty];
    let reward = Math.floor(Math.random() * (base.max - base.min + 1)) + base.min;

    if (isSuccess) {
        // Netrunning skill bonus: +10% per level
        reward = Math.floor(reward * (1 + (userNetrunning * 0.1)));
    } else {
        // Failure penalty: lose 20-50% of potential reward
        const penalty = 0.2 + (Math.random() * 0.3);
        reward = Math.floor(reward * penalty);
    }

    const xpGain = isSuccess ? Math.floor(reward / 8) : Math.floor(reward / 15);

    // Calculate street cred gain
    let streetCredGain = 0;
    if (isSuccess) {
        const streetCredChance = {
            easy: 0.1,    // 10% chance
            medium: 0.2,  // 20% chance
            hard: 0.3     // 30% chance
        };

        if (Math.random() < streetCredChance[difficulty]) {
            streetCredGain = 1;
            // Higher difficulty = better chance of bonus street cred
            if (difficulty === 'hard' && Math.random() < 0.1) {
                streetCredGain = 2;
            }
        }
    }

    return { reward, xpGain, streetCredGain };
}

function calculateTraceIncrease(difficulty, isSuccess, currentTrace) {
    if (isSuccess) {
        // Small chance to reduce trace on success
        if (Math.random() < 0.2 && currentTrace > 0) {
            return -1;
        }
        return 0;
    } else {
        // Failure increases trace
        const traceIncrease = {
            easy: Math.random() < 0.3 ? 1 : 0,
            medium: Math.random() < 0.5 ? 1 : 0,
            hard: Math.random() < 0.7 ? 1 : 0
        };
        return traceIncrease[difficulty];
    }
}

function getFailureConsequence(difficulty, traceLevel) {
    const consequences = {
        easy: [
            "Your connection was traced but you escaped.",
            "Minor ICE detected your presence.",
            "A firewall slowed your data extraction."
        ],
        medium: [
            "Corporate countermeasures activated!",
            "Your neural implants sparked from feedback.",
            "ICE nearly trapped you in a recursive loop.",
            "Security algorithms adapted to your methods."
        ],
        hard: [
            "Black ICE nearly fried your cortex!",
            "Military-grade countermeasures engaged!",
            "Your neural pathways are damaged from feedback.",
            "Corporate hunters are now tracking your signal.",
            "Quantum encryption overwhelmed your processors."
        ]
    };

    const options = consequences[difficulty];
    return options[Math.floor(Math.random() * options.length)];
}

module.exports.calculateSuccessRate = calculateSuccessRate;
module.exports.calculateRewards = calculateRewards;
module.exports.calculateTraceIncrease = calculateTraceIncrease;
module.exports.getFailureConsequence = getFailureConsequence;