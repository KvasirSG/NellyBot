const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const logtail = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('privacy')
        .setDescription('Manage your privacy and personal data')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View all your stored data'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Permanently delete all your data'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('export')
                .setDescription('Export your data in JSON format')),

    async execute(interaction, db) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'view':
                await handleViewData(interaction, db);
                break;
            case 'delete':
                await handleDeleteData(interaction, db);
                break;
            case 'export':
                await handleExportData(interaction, db);
                break;
        }
    }
};

async function handleViewData(interaction, db) {
    try {
        const userData = await db.getUserPrivacyData(interaction.user.id);

        if (!userData) {
            const embed = createCyberpunkEmbed(
                'No Data Found',
                '📭 **NO STORED DATA**\n\nYou have no data stored in our systems.\n\nUse `/jack-in` to create a character profile.',
                colors.info
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            return;
        }

        // Format the data for display
        const formattedData = {
            'Discord ID': userData.user_id,
            'Discord Username': userData.username,
            'Street Name': userData.street_name || 'Not set',
            'Background': userData.background || 'Not set',
            'Backstory': userData.backstory || 'Not set',
            'Level': userData.level,
            'XP': userData.xp,
            'Credits': userData.credits,
            'Health': `${userData.health}/${userData.max_health}`,
            'Cybernetics': userData.cybernetics,
            'Street Cred': userData.street_cred,
            'Netrunning': userData.netrunning,
            'Combat': userData.combat,
            'Tech': userData.tech,
            'Trace Level': userData.trace_level,
            'Failed Hacks': userData.failed_hacks,
            'Successful Hacks': userData.successful_hacks,
            'Privacy Accepted': userData.privacy_accepted ? new Date(userData.privacy_accepted).toLocaleString() : 'Not accepted',
            'Character Created': userData.character_created ? 'Yes' : 'No',
            'Account Created': new Date(userData.created_at).toLocaleString(),
            'Last Daily': userData.last_daily ? new Date(userData.last_daily).toLocaleString() : 'Never',
            'Last Hack': userData.last_hack ? new Date(userData.last_hack).toLocaleString() : 'Never'
        };

        const dataDisplay = Object.entries(formattedData)
            .map(([key, value]) => `**${key}:** ${value}`)
            .join('\n');

        const embed = createCyberpunkEmbed(
            'Your Stored Data',
            `🔍 **DATA PROFILE REPORT**\n\n` +
            `Here is all the data we store about you:\n\n` +
            dataDisplay + '\n\n' +
            `📝 **Data Usage:**\n` +
            `• Game progression tracking\n` +
            `• Command cooldown enforcement\n` +
            `• Leaderboard generation\n` +
            `• Character customization\n\n` +
            `🗑️ Use \`/privacy delete\` to remove all this data.`,
            colors.info
        );

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } catch (error) {
        logtail.error('Error viewing privacy data', {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            username: interaction.user.username
        });
        await interaction.reply({
            content: '⚠️ Error retrieving your data. Please try again.',
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleDeleteData(interaction, db) {
    try {
        const userData = await db.getUserPrivacyData(interaction.user.id);

        if (!userData) {
            const embed = createCyberpunkEmbed(
                'No Data to Delete',
                '📭 **NO STORED DATA**\n\nYou have no data stored in our systems.',
                colors.info
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            return;
        }

        // Actually delete the data
        await db.deleteUserData(interaction.user.id);

        const embed = createCyberpunkEmbed(
            'Data Deletion Complete',
            `🗑️ **NEURAL WIPE SUCCESSFUL**\n\n` +
            `All your data has been permanently deleted from our systems:\n\n` +
            `✅ Character profile erased\n` +
            `✅ Game progression wiped\n` +
            `✅ Privacy consent revoked\n` +
            `✅ All timestamps cleared\n\n` +
            `**Your account has been completely removed.**\n\n` +
            `If you want to use the bot again, you'll need to start fresh with \`/jack-in\`.`,
            colors.warning
        );

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        logtail.info('User data deletion completed successfully', {
            userId: interaction.user.id,
            username: interaction.user.username
        });

    } catch (error) {
        logtail.error('Error deleting user data', {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            username: interaction.user.username
        });
        await interaction.reply({
            content: '⚠️ Error deleting your data. Please contact an administrator.',
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleExportData(interaction, db) {
    try {
        const userData = await db.getUserPrivacyData(interaction.user.id);

        if (!userData) {
            const embed = createCyberpunkEmbed(
                'No Data to Export',
                '📭 **NO STORED DATA**\n\nYou have no data stored in our systems.',
                colors.info
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            return;
        }

        // Clean up the data for export (remove internal fields)
        const exportData = { ...userData };
        delete exportData.user_id; // Keep private

        const jsonData = JSON.stringify(exportData, null, 2);

        // Discord has a 2000 character limit for messages
        if (jsonData.length > 1900) {
            const embed = createCyberpunkEmbed(
                'Data Export',
                `📦 **DATA EXPORT COMPLETE**\n\n` +
                `Your data export is too large to display here.\n\n` +
                `**Summary:**\n` +
                `• Street Name: ${userData.street_name || 'Not set'}\n` +
                `• Background: ${userData.background || 'Not set'}\n` +
                `• Level: ${userData.level}\n` +
                `• Credits: ${userData.credits}\n` +
                `• Total fields: ${Object.keys(exportData).length}\n\n` +
                `Contact an administrator for the complete export file.`,
                colors.info
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
            const embed = createCyberpunkEmbed(
                'Data Export',
                `📦 **DATA EXPORT COMPLETE**\n\n` +
                `Here is your data in JSON format:\n\n` +
                `\`\`\`json\n${jsonData}\`\`\`\n\n` +
                `This export contains all your stored data. You can save this for your records.`,
                colors.info
            );
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

    } catch (error) {
        logtail.error('Error exporting user data', {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            username: interaction.user.username
        });
        await interaction.reply({
            content: '⚠️ Error exporting your data. Please try again.',
            flags: MessageFlags.Ephemeral
        });
    }
}