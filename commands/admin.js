const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const { canManageBot, isStrictOwner } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin-only commands for bot management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('[Owner Only] Show bot statistics and system info'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shutdown')
                .setDescription('[Owner Only] Safely shutdown the bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset-user')
                .setDescription('[Owner Only] Reset a user\'s data')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to reset')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('give-credits')
                .setDescription('[Owner Only] Give credits to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to give credits to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of credits to give')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100000))),

    async execute(interaction, db) {
        const client = interaction.client;

        // Check if user can manage the bot
        const canManage = await canManageBot(client, interaction);
        if (!canManage) {
            const embed = createCyberpunkEmbed(
                'Access Denied',
                '🚫 **UNAUTHORIZED ACCESS**\n\nYou need Administrator permissions or be a bot owner to use admin commands.',
                colors.danger
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'stats':
                await handleStats(interaction, client, db);
                break;
            case 'shutdown':
                await handleShutdown(interaction, client);
                break;
            case 'reset-user':
                await handleResetUser(interaction, db);
                break;
            case 'give-credits':
                await handleGiveCredits(interaction, db);
                break;
        }
    }
};

async function handleStats(interaction, client, db) {
    // This command requires strict owner permissions
    const isOwner = await isStrictOwner(client, interaction.user.id);
    if (!isOwner) {
        const embed = createCyberpunkEmbed(
            'Access Denied',
            '🚫 **OWNER ONLY COMMAND**\n\nOnly the bot owner can view sensitive bot statistics.',
            colors.danger
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    try {
        // Get database stats
        const userCount = await db.getUserCount();
        const totalCredits = await db.getTotalCredits();

        const embed = createCyberpunkEmbed(
            'Bot Statistics',
            `📊 **System Status Report**\n\n` +
            `🤖 **Bot Info:**\n` +
            `• Servers: ${client.guilds.cache.size}\n` +
            `• Users: ${client.users.cache.size}\n` +
            `• Uptime: ${formatUptime(client.uptime)}\n\n` +
            `💾 **Database Stats:**\n` +
            `• Registered Users: ${userCount}\n` +
            `• Total Credits in Economy: ${totalCredits.toLocaleString()}\n\n` +
            `⚡ **Performance:**\n` +
            `• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
            `• Node.js: ${process.version}\n` +
            `• Discord.js: v${require('discord.js').version}`,
            colors.info
        );

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in admin stats:', error);
        await interaction.reply({
            content: '⚠️ Error retrieving bot statistics.',
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleShutdown(interaction, client) {
    // This command requires strict owner permissions
    const isOwner = await isStrictOwner(client, interaction.user.id);
    if (!isOwner) {
        const embed = createCyberpunkEmbed(
            'Access Denied',
            '🚫 **OWNER ONLY COMMAND**\n\nOnly the bot owner can shut down the bot.',
            colors.danger
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const embed = createCyberpunkEmbed(
        'System Shutdown',
        '⚠️ **INITIATING SHUTDOWN SEQUENCE**\n\nDisconnecting from the matrix...',
        colors.warning
    );

    await interaction.reply({ embeds: [embed] });

    console.log('Bot shutdown initiated by owner');

    // Graceful shutdown after a short delay
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

async function handleResetUser(interaction, db) {
    // This command requires strict owner permissions
    const isOwner = await isStrictOwner(interaction.client, interaction.user.id);
    if (!isOwner) {
        const embed = createCyberpunkEmbed(
            'Access Denied',
            '🚫 **OWNER ONLY COMMAND**\n\nOnly the bot owner can reset user data. This prevents economy manipulation.',
            colors.danger
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const targetUser = interaction.options.getUser('user');

    try {
        const user = await db.getUser(targetUser.id);
        if (!user) {
            await interaction.reply({
                content: `⚠️ User ${targetUser.tag} is not registered in the database.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await db.resetUser(targetUser.id);

        const embed = createCyberpunkEmbed(
            'User Reset Complete',
            `🔄 **Data Wipe Successful**\n\n` +
            `User: ${targetUser.tag}\n` +
            `Previous Level: ${user.level}\n` +
            `Previous Credits: ${user.credits.toLocaleString()}\n\n` +
            `All user data has been reset to default values.`,
            colors.warning
        );

        await interaction.reply({ embeds: [embed] });

        console.log('User profile reset completed by admin');
    } catch (error) {
        console.error('Error resetting user:', error);
        await interaction.reply({
            content: '⚠️ Error resetting user data.',
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleGiveCredits(interaction, db) {
    // This command requires strict owner permissions
    const isOwner = await isStrictOwner(interaction.client, interaction.user.id);
    if (!isOwner) {
        const embed = createCyberpunkEmbed(
            'Access Denied',
            '🚫 **OWNER ONLY COMMAND**\n\nOnly the bot owner can give credits. This prevents economy manipulation.',
            colors.danger
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    try {
        let user = await db.getUser(targetUser.id);
        if (!user) {
            await interaction.reply({
                content: `⚠️ User ${targetUser.tag} is not registered. They need to use \`/jack-in\` first.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const newCredits = user.credits + amount;
        await db.updateUser(targetUser.id, { credits: newCredits });

        const embed = createCyberpunkEmbed(
            'Credits Transferred',
            `💰 **Corporate Wire Transfer Complete**\n\n` +
            `Recipient: ${targetUser.tag}\n` +
            `Amount: ${amount.toLocaleString()} eddies\n` +
            `Previous Balance: ${user.credits.toLocaleString()}\n` +
            `New Balance: ${newCredits.toLocaleString()}\n\n` +
            `*Transaction logged in corporate database.*`,
            colors.success
        );

        await interaction.reply({ embeds: [embed] });

        console.log(`${amount} credits transferred by admin`);
    } catch (error) {
        console.error('Error giving credits:', error);
        await interaction.reply({
            content: '⚠️ Error processing credit transfer.',
            flags: MessageFlags.Ephemeral
        });
    }
}

function formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}