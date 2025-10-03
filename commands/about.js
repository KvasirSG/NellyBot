const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Learn about NellyBot - commands, features, and credits'),

    async execute(interaction, db) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('about_menu')
            .setPlaceholder('📖 Select information to view...')
            .addOptions([
                {
                    label: '🤖 About NellyBot',
                    description: 'General information about the bot',
                    value: 'bot_info',
                    emoji: '🤖'
                },
                {
                    label: '⚔️ Commands Overview',
                    description: 'List of available commands and features',
                    value: 'commands',
                    emoji: '⚔️'
                },
                {
                    label: '👥 Credits & Contributors',
                    description: 'People behind NellyBot',
                    value: 'credits',
                    emoji: '👥'
                },
                {
                    label: '🛡️ Privacy & Security',
                    description: 'Data handling and privacy information',
                    value: 'privacy',
                    emoji: '🛡️'
                },
                {
                    label: '🔗 Links & Resources',
                    description: 'Useful links and external resources',
                    value: 'links',
                    emoji: '🔗'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const initialEmbed = createCyberpunkEmbed(
            '🤖 NellyBot Information Center',
            '**Welcome to Night City, Choom!**\n\n' +
            'NellyBot is your cyberpunk companion in Discord - a feature-rich RPG bot that brings the neon-soaked streets of Night City to your server.\n\n' +
            '🔽 **Use the dropdown menu below to explore:**\n' +
            '• Bot information and features\n' +
            '• Complete command reference\n' +
            '• Credits and contributors\n' +
            '• Privacy and security details\n' +
            '• Useful links and resources',
            colors.primary
        );

        const response = await interaction.reply({
            embeds: [initialEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (selectInteraction) => {
            if (selectInteraction.user.id !== interaction.user.id) {
                await selectInteraction.reply({
                    content: '⚠️ Only the command user can use this menu.',
                    ephemeral: true
                });
                return;
            }

            let embed;
            const selectedValue = selectInteraction.values[0];

            switch (selectedValue) {
                case 'bot_info':
                    embed = createCyberpunkEmbed(
                        '🤖 About NellyBot',
                        '**🌃 Welcome to Night City**\n\n' +
                        'NellyBot is a cyberpunk-themed Discord RPG bot that transforms your server into a digital dystopia. Create your character, jack into the net, and build your reputation in the sprawling metropolis of Night City.\n\n' +
                        '**✨ Key Features:**\n' +
                        '🎭 **Character Creation** - Choose from multiple backgrounds\n' +
                        '💻 **Netrunning** - Hack systems and earn credits\n' +
                        '⚔️ **Combat System** - Engage in cyberpunk battles\n' +
                        '🛡️ **Privacy First** - Your data is protected\n' +
                        '📊 **Progression** - Level up and gain street cred\n' +
                        '💰 **Economy** - Earn and spend eddies\n\n' +
                        '**🎮 Getting Started:**\n' +
                        '1. Use `/jack-in` to create your character\n' +
                        '2. Check your `/profile` to see your stats\n' +
                        '3. Start `/hack`ing to earn credits and XP\n' +
                        '4. Use `/upgrade` to improve your skills\n\n' +
                        '*"The future is here, choom. Time to jack in."*',
                        colors.primary
                    );
                    break;

                case 'commands':
                    embed = createCyberpunkEmbed(
                        '⚔️ NellyBot Commands',
                        '**🔧 Character Management**\n' +
                        '`/jack-in` - Create your cyberpunk character\n' +
                        '`/profile` - View your character stats and info\n' +
                        '`/privacy` - Manage your data and privacy settings\n\n' +
                        '**💻 Netrunning & Combat**\n' +
                        '`/hack` - Hack systems to earn credits and XP\n' +
                        '`/heal` - Restore your health\n' +
                        '`/upgrade` - Improve your character skills\n\n' +
                        '**💰 Economy & Rewards**\n' +
                        '`/daily` - Claim your daily credits\n' +
                        '`/credits` - Check your current balance\n' +
                        '`/leaderboard` - See top players\n\n' +
                        '**ℹ️ Information**\n' +
                        '`/about` - View this information center\n\n' +
                        '**🛡️ Admin Commands**\n' +
                        '`/admin` - Server administration tools (Admin only)\n\n' +
                        '**💡 Pro Tips:**\n' +
                        '• Start with `/jack-in` to create your character\n' +
                        '• Use `/daily` every day for free credits\n' +
                        '• Check `/privacy` to understand data handling\n' +
                        '• Higher skills unlock better rewards!',
                        colors.success
                    );
                    break;

                case 'credits':
                    try {
                        const creditsPath = path.join(__dirname, '../config/credits.yml');
                        const creditsData = yaml.load(fs.readFileSync(creditsPath, 'utf8'));

                        let creditsContent = '**🛠️ Development Team**\n\n';

                        // Main team
                        if (creditsData.main_team && creditsData.main_team.length > 0) {
                            creditsContent += '**Main Development Team:**\n';
                            creditsData.main_team.forEach(member => {
                                creditsContent += `${member.emoji} **${member.name}** - *${member.role}*\n`;
                                creditsContent += `└ ${member.description}\n\n`;
                            });
                        }

                        // Contributors
                        if (creditsData.contributors && creditsData.contributors.length > 0) {
                            creditsContent += '**Contributors:**\n';
                            creditsData.contributors.forEach(contributor => {
                                creditsContent += `${contributor.emoji} **${contributor.name}** - *${contributor.role}*\n`;
                                creditsContent += `└ ${contributor.description}\n\n`;
                            });
                        }

                        // AI Assistance
                        if (creditsData.ai_assistance && creditsData.ai_assistance.length > 0) {
                            creditsContent += '**🤖 AI Assistance:**\n';
                            creditsData.ai_assistance.forEach(ai => {
                                creditsContent += `${ai.emoji} **${ai.name}** - *${ai.role}*\n`;
                                creditsContent += `└ ${ai.description}\n\n`;
                            });
                        }

                        // Inspiration
                        if (creditsData.inspiration && creditsData.inspiration.length > 0) {
                            creditsContent += '**🎨 Inspiration & Theme**\n';
                            creditsData.inspiration.forEach(source => {
                                creditsContent += `${source.emoji} **${source.name}** - ${source.role}\n`;
                            });
                            creditsContent += '\n';
                        }

                        // Special thanks
                        if (creditsData.special_thanks && creditsData.special_thanks.length > 0) {
                            creditsContent += '**🙏 Special Thanks**\n';
                            creditsData.special_thanks.forEach(thanks => {
                                creditsContent += `• ${thanks}\n`;
                            });
                            creditsContent += '\n';
                        }

                        // Footer message
                        if (creditsData.footer_message) {
                            creditsContent += `*${creditsData.footer_message}*`;
                        }

                        embed = createCyberpunkEmbed(
                            '👥 Credits & Contributors',
                            creditsContent,
                            colors.info
                        );
                    } catch (error) {
                        // Fallback in case YAML file is missing or corrupted
                        embed = createCyberpunkEmbed(
                            '👥 Credits & Contributors',
                            '**🛠️ Development Team**\n\n' +
                            'Credits configuration temporarily unavailable.\n\n' +
                            '*Check back later for full credits information.*',
                            colors.warning
                        );
                    }
                    break;

                case 'privacy':
                    embed = createCyberpunkEmbed(
                        '🛡️ Privacy & Security',
                        '**🔒 Data Protection**\n\n' +
                        'NellyBot takes your privacy seriously. Here\'s what we collect and how we protect it:\n\n' +
                        '**📊 Data We Store:**\n' +
                        '• Discord User ID (for character linking)\n' +
                        '• Character stats and progression\n' +
                        '• Game-related choices and preferences\n' +
                        '• Command usage for improvement\n\n' +
                        '**🚫 Data We DON\'T Store:**\n' +
                        '• Personal messages or chat content\n' +
                        '• Email addresses or real names\n' +
                        '• Location or IP addresses\n' +
                        '• Any sensitive personal information\n\n' +
                        '**🛡️ Security Measures:**\n' +
                        '• All data is stored locally and securely\n' +
                        '• No data sharing with third parties\n' +
                        '• Regular security updates and monitoring\n' +
                        '• Option to delete your data anytime\n\n' +
                        '**⚙️ Your Rights:**\n' +
                        '• Use `/privacy view` to see your stored data\n' +
                        '• Use `/privacy delete` to remove all your data\n' +
                        '• Contact administrators for data inquiries\n\n' +
                        '*Your data, your control. Always.*',
                        colors.warning
                    );
                    break;

                case 'links':
                    embed = createCyberpunkEmbed(
                        '🔗 Links & Resources',
                        '**📚 Documentation & Support**\n\n' +
                        '**🔧 Development:**\n' +
                        '• [GitHub Repository](https://github.com/northenfreyja/NellyBot)\n' +
                        '• [Issue Tracker](https://github.com/northenfreyja/NellyBot/issues)\n' +
                        '• [Contributing Guide](https://github.com/northenfreyja/NellyBot/blob/master/CONTRIBUTING.md)\n\n' +
                        '**🤖 Discord.js Resources:**\n' +
                        '• [Discord.js Documentation](https://discord.js.org/)\n' +
                        '• [Discord Developer Portal](https://discord.com/developers/docs)\n\n' +
                        '**🎮 Cyberpunk Universe:**\n' +
                        '• [Cyberpunk 2077 Official](https://www.cyberpunk.net/)\n' +
                        '• [Cyberpunk Wiki](https://cyberpunk.fandom.com/)\n\n' +
                        '**💡 Getting Help:**\n' +
                        '• Use `/privacy` for data-related questions\n' +
                        '• Contact server administrators for support\n' +
                        '• Report bugs on our GitHub issues page\n' +
                        '• Check command descriptions with `/help`\n\n' +
                        '**🚀 Stay Updated:**\n' +
                        '• Follow the GitHub repository for updates\n' +
                        '• Join community discussions\n' +
                        '• Check release notes for new features\n\n' +
                        '*Welcome to the future, choom!*',
                        colors.info
                    );
                    break;
            }

            await selectInteraction.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    selectMenu.setDisabled(true)
                );

            try {
                await response.edit({ components: [disabledRow] });
            } catch (error) {
                // Ignore errors if message was deleted
            }
        });
    }
};