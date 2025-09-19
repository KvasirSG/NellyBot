const { createCyberpunkEmbed, colors } = require('../utils/embeds');
const { checkCommandAccess } = require('../utils/commandLock');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, db) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // Check if user has access to this command (character creation required)
                await checkCommandAccess(db, interaction, async () => {
                    await command.execute(interaction, db);
                });
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);

                const errorMessage = {
                    content: '⚠️ **SYSTEM ERROR**: Failed to execute command. Neural pathways may be unstable.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } else if (interaction.isButton()) {
            try {
                await handleButtonInteraction(interaction, db);
            } catch (error) {
                console.error('Error handling button interaction:', error);

                const errorMessage = {
                    content: '⚠️ **INTERFACE ERROR**: Button malfunction detected.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                await handleSelectMenuInteraction(interaction, db);
            } catch (error) {
                console.error('Error handling select menu interaction:', error);

                const errorMessage = {
                    content: '⚠️ **INTERFACE ERROR**: Menu malfunction detected.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                await handleModalSubmit(interaction, db);
            } catch (error) {
                console.error('Error handling modal submit:', error);

                const errorMessage = {
                    content: '⚠️ **INTERFACE ERROR**: Modal processing failed.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    }
};

async function handleButtonInteraction(interaction, db) {
    const customId = interaction.customId;

    if (customId.startsWith('upgrade_confirm_')) {
        const parts = customId.split('_');
        const stat = parts[2];
        const userId = parts[3];

        // Verify the user clicking is the same as the command user
        if (interaction.user.id !== userId) {
            await interaction.reply({
                content: '⚠️ This upgrade confirmation is not for you, choom.',
                ephemeral: true
            });
            return;
        }

        let user = await db.getUser(interaction.user.id);
        if (!user) {
            await interaction.reply({
                content: '⚠️ User profile not found. Use `/jack-in` first.',
                ephemeral: true
            });
            return;
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
            await interaction.update({ embeds: [embed], components: [] });
            return;
        }

        // Double-check they still have enough credits
        if (user.credits < cost) {
            const embed = createCyberpunkEmbed(
                'Insufficient Funds',
                `💸 You no longer have enough eddies for this upgrade.\nCost: **${cost}** eddies\nBalance: **${user.credits}** eddies`,
                colors.danger
            );
            await interaction.update({ embeds: [embed], components: [] });
            return;
        }

        // Perform the upgrade
        const updates = {
            credits: user.credits - cost,
            [stat]: currentLevel + 1
        };

        await db.updateUser(interaction.user.id, updates);

        const statDescriptions = {
            cybernetics: 'Increases overall effectiveness and unlocks advanced features',
            street_cred: 'Opens up better missions and black market access',
            netrunning: 'Improves hacking rewards and success rates',
            combat: 'Better performance in combat missions and PvP',
            tech: 'Crafting bonuses and equipment effectiveness'
        };

        const embed = createCyberpunkEmbed(
            'Upgrade Complete',
            `⬆️ **${statNames[stat]}** upgraded!\n\n` +
            `Level: **${currentLevel}** → **${currentLevel + 1}**\n` +
            `Cost: **${cost}** eddies\n` +
            `Remaining credits: **${user.credits - cost}** eddies\n\n` +
            `*${statDescriptions[stat]}*`,
            colors.primary
        );

        await interaction.update({ embeds: [embed], components: [] });

    } else if (customId.startsWith('upgrade_cancel_')) {
        const userId = customId.split('_')[2];

        // Verify the user clicking is the same as the command user
        if (interaction.user.id !== userId) {
            await interaction.reply({
                content: '⚠️ This is not your upgrade menu, choom.',
                ephemeral: true
            });
            return;
        }

        const embed = createCyberpunkEmbed(
            'Upgrade Cancelled',
            '❌ **Neural interface upgrade cancelled.**\n\nYour eddies remain untouched. Stay frosty, netrunner.',
            colors.info
        );

        await interaction.update({ embeds: [embed], components: [] });
    } else if (customId.startsWith('hack_')) {
        await handleHackInteraction(interaction, db);
    } else if (customId.startsWith('privacy_')) {
        await handlePrivacyInteraction(interaction, db);
    } else if (customId.startsWith('create_character_')) {
        await handleCharacterCreationStart(interaction, db);
    } else if (customId.startsWith('view_backstory_')) {
        await handleBackstoryView(interaction, db);
    }
}

async function handleHackInteraction(interaction, db) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // easy, medium, hard, info
    const userId = parts[2];

    // Import hack functions
    const hackModule = require('../commands/hack.js');

    // Verify user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This hack session is not for you, choom.',
            ephemeral: true
        });
        return;
    }

    if (action === 'info') {
        const infoEmbed = createCyberpunkEmbed(
            'Hacking Information',
            `📖 **How Hacking Works**\n\n` +
            `**🎯 Success Rate Calculation:**\n` +
            `• Base rate varies by difficulty\n` +
            `• +2% per Netrunning level\n` +
            `• -5% per Trace level\n\n` +
            `**⏰ Cooldown System:**\n` +
            `• ✅ **Successful hacks**: NO cooldown!\n` +
            `• ❌ **Failed hacks**: 1 hour + trace penalties\n` +
            `• Chain successful hacks for maximum efficiency!\n\n` +
            `**📡 Trace System:**\n` +
            `• Failures increase trace level (0-10)\n` +
            `• Higher trace = longer failure cooldowns\n` +
            `• Successful hacks may reduce trace (20% chance)\n\n` +
            `**🎲 Difficulty Levels:**\n` +
            `🟢 **Script Kiddie**: 90% base, 50-150 eddies, low risk\n` +
            `🟡 **Corporate Node**: 70% base, 100-300 eddies, medium risk\n` +
            `🔴 **Military ICE**: 50% base, 200-500 eddies, high risk\n\n` +
            `💡 **Strategy**: Upgrade Netrunning for better success rates and rewards!`,
            colors.info
        );

        await interaction.update({ embeds: [infoEmbed], components: [] });
        return;
    }

    // Execute hack attempt
    let user = await db.getUser(interaction.user.id);
    if (!user) {
        await interaction.reply({
            content: '⚠️ User profile not found. Use `/jack-in` first.',
            ephemeral: true
        });
        return;
    }

    const difficulty = action;
    const successRate = hackModule.calculateSuccessRate(user.netrunning, difficulty, user.trace_level);
    const isSuccess = Math.random() * 100 <= successRate;

    const { reward, xpGain, streetCredGain } = hackModule.calculateRewards(difficulty, user.netrunning, isSuccess);
    const traceChange = hackModule.calculateTraceIncrease(difficulty, isSuccess, user.trace_level);

    const now = new Date();
    const newLevel = Math.floor((user.xp + xpGain) / 100) + 1;
    const leveledUp = newLevel > user.level;

    // Update user stats
    const updates = {
        credits: isSuccess ? user.credits + reward : Math.max(0, user.credits - reward),
        xp: user.xp + xpGain,
        level: newLevel,
        street_cred: user.street_cred + streetCredGain,
        trace_level: Math.max(0, Math.min(10, user.trace_level + traceChange)),
        failed_hacks: isSuccess ? user.failed_hacks : user.failed_hacks + 1,
        successful_hacks: isSuccess ? user.successful_hacks + 1 : user.successful_hacks,
        last_hack: now.toISOString()
    };

    // Only set failure cooldown if hack failed
    if (!isSuccess) {
        updates.last_failed_hack = now.toISOString();
    }

    // Health damage on failure for harder difficulties
    if (!isSuccess && difficulty !== 'easy') {
        const healthDamage = difficulty === 'hard' ? 15 : 10;
        updates.health = Math.max(0, user.health - healthDamage);
    }

    await db.updateUser(interaction.user.id, updates);

    // Create result embed
    let title, description, color;

    if (isSuccess) {
        title = '🎯 Hack Successful';
        description = `💻 **BREACH COMPLETE**\n\n` +
            `🎯 **Target**: ${difficulty === 'easy' ? 'Script Kiddie Network' : difficulty === 'medium' ? 'Corporate Node' : 'Military ICE'}\n` +
            `📊 **Success Rate**: ${successRate}%\n\n` +
            `💰 **Gained**: ${reward} eddies\n` +
            `⭐ **XP**: +${xpGain}\n`;

        if (streetCredGain > 0) {
            description += `🌃 **Street Cred**: +${streetCredGain} (${user.street_cred} → ${updates.street_cred})\n`;
        }

        if (traceChange < 0) {
            description += `🛡️ **Trace Reduced**: ${user.trace_level} → ${updates.trace_level}\n`;
        }

        description += `\n🔥 Your netrunning skills prove effective in the data streams...\n\n` +
            `✨ **No cooldown applied** - successful hacks let you continue immediately!`;
        color = colors.primary;
    } else {
        title = '⚠️ Hack Failed';
        const consequence = hackModule.getFailureConsequence(difficulty, user.trace_level);

        description = `💥 **BREACH FAILED**\n\n` +
            `🎯 **Target**: ${difficulty === 'easy' ? 'Script Kiddie Network' : difficulty === 'medium' ? 'Corporate Node' : 'Military ICE'}\n` +
            `📊 **Success Rate**: ${successRate}%\n\n` +
            `💸 **Lost**: ${reward} eddies\n` +
            `⭐ **XP**: +${xpGain} (learning from failure)\n`;

        if (traceChange > 0) {
            description += `📡 **Trace Increased**: ${user.trace_level} → ${updates.trace_level}\n`;
        }

        if (updates.health < user.health) {
            description += `❤️ **Health Lost**: ${user.health - updates.health} points\n`;
        }

        description += `\n💀 ${consequence}\n\n` +
            `⏰ **Cooldown applied**: ${Math.ceil((60 + user.trace_level * 30))} minutes before next hack attempt`;
        color = colors.danger;
    }

    if (leveledUp) {
        description += `\n\n🎉 **LEVEL UP!** You are now level **${newLevel}**!`;
    }

    // Add warning if trace is high
    if (updates.trace_level >= 7) {
        description += `\n\n🚨 **HIGH TRACE WARNING**: Corporate security is closing in! (Level ${updates.trace_level}/10)`;
    }

    const resultEmbed = createCyberpunkEmbed(title, description, color);
    await interaction.update({ embeds: [resultEmbed], components: [] });
}

async function handlePrivacyInteraction(interaction, db) {
    const {
        createPrivacyInfoEmbed,
        createPrivacyDeclinedEmbed,
        createCharacterCreationEmbed,
        createCharacterCreationButton
    } = require('../utils/privacy');

    const parts = interaction.customId.split('_');
    const action = parts[1]; // accept, decline, info
    const userId = parts[2];

    // Verify the user clicking is the same as the target user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This privacy consent is not for you.',
            ephemeral: true
        });
        return;
    }

    if (action === 'accept') {
        // Accept privacy consent and create user record
        await db.acceptPrivacy(interaction.user.id, interaction.user.username);

        const embed = createCharacterCreationEmbed();
        const button = createCharacterCreationButton(interaction.user.id);
        await interaction.update({ embeds: [embed], components: [button] });

    } else if (action === 'decline') {
        const embed = createPrivacyDeclinedEmbed();
        await interaction.update({ embeds: [embed], components: [] });

    } else if (action === 'info') {
        const embed = createPrivacyInfoEmbed();
        await interaction.update({ embeds: [embed], components: [] });
    }
}

async function handleCharacterCreationStart(interaction, db) {
    const { createCharacterModal } = require('../utils/character');

    const userId = interaction.customId.split('_')[2];

    // Verify the user clicking is the same as the target user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This character creation is not for you.',
            ephemeral: true
        });
        return;
    }

    // Check if user has privacy consent
    const characterStatus = await db.hasCharacter(interaction.user.id);
    if (!characterStatus.hasPrivacyConsent) {
        await interaction.reply({
            content: '⚠️ You must accept privacy terms first. Use `/jack-in` to start over.',
            ephemeral: true
        });
        return;
    }

    const modal = createCharacterModal(interaction.user.id);
    await interaction.showModal(modal);
}

async function handleSelectMenuInteraction(interaction, db) {
    const customId = interaction.customId;

    if (customId.startsWith('background_select_')) {
        await handleBackgroundSelection(interaction, db);
    }
}

async function handleBackgroundSelection(interaction, db) {
    const {
        applyBackgroundBonuses,
        createCharacterCompleteEmbed,
        BACKGROUNDS
    } = require('../utils/character');

    const userId = interaction.customId.split('_')[2];

    // Verify the user selecting is the same as the target user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This character creation is not for you.',
            ephemeral: true
        });
        return;
    }

    const selectedBackground = interaction.values[0];
    const backgroundData = BACKGROUNDS[selectedBackground];

    if (!backgroundData) {
        await interaction.reply({
            content: '⚠️ Invalid background selection.',
            ephemeral: true
        });
        return;
    }

    // Get user's current character data from temporary storage
    const user = await db.getUser(interaction.user.id);
    if (!user || !user.street_name) {
        await interaction.reply({
            content: '⚠️ Character creation data not found. Please restart with `/jack-in`.',
            ephemeral: true
        });
        return;
    }

    // Apply background bonuses
    const { bonuses, startingCredits } = applyBackgroundBonuses(selectedBackground);

    // Complete character creation
    await db.createCharacter(interaction.user.id, user.street_name, selectedBackground, user.backstory || '');

    // Apply starting bonuses
    const updates = {
        credits: startingCredits,
        ...bonuses
    };
    await db.updateUser(interaction.user.id, updates);

    const embed = createCharacterCompleteEmbed(
        user.street_name,
        selectedBackground,
        user.backstory,
        bonuses,
        startingCredits
    );

    await interaction.update({ embeds: [embed], components: [] });
}

async function handleModalSubmit(interaction, db) {
    const customId = interaction.customId;

    if (customId.startsWith('character_creation_')) {
        await handleCharacterCreationModal(interaction, db);
    }
}

async function handleCharacterCreationModal(interaction, db) {
    const {
        createBackgroundSelectEmbed,
        createBackgroundSelectMenu
    } = require('../utils/character');

    const userId = interaction.customId.split('_')[2];

    // Verify the user submitting is the same as the target user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This character creation is not for you.',
            ephemeral: true
        });
        return;
    }

    const streetName = interaction.fields.getTextInputValue('street_name');
    const backstory = interaction.fields.getTextInputValue('backstory') || '';

    // Validate street name
    if (streetName.length < 2 || streetName.length > 32) {
        await interaction.reply({
            content: '⚠️ Street name must be between 2 and 32 characters.',
            ephemeral: true
        });
        return;
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['discord', 'everyone', 'here', '@'];
    if (inappropriateWords.some(word => streetName.toLowerCase().includes(word))) {
        await interaction.reply({
            content: '⚠️ Street name contains inappropriate content.',
            ephemeral: true
        });
        return;
    }

    // Temporarily store the character data
    await db.updateUser(interaction.user.id, {
        street_name: streetName,
        backstory: backstory
    });

    // Show background selection
    const embed = createBackgroundSelectEmbed();
    const selectMenu = createBackgroundSelectMenu(interaction.user.id);

    await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
}

async function handleBackstoryView(interaction, db) {
    const userId = interaction.customId.split('_')[2];

    // Verify the user clicking is the same as the target user
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: '⚠️ This backstory is not for you.',
            ephemeral: true
        });
        return;
    }

    const user = await db.getUser(interaction.user.id);
    if (!user || !user.backstory || !user.backstory.trim()) {
        await interaction.reply({
            content: '⚠️ No backstory found for your character.',
            ephemeral: true
        });
        return;
    }

    const displayName = user.street_name || interaction.user.username;
    const embed = createCyberpunkEmbed(
        `${displayName}'s Backstory`,
        `📖 **Character History**\n\n*"${user.backstory}"*\n\n*—${displayName}, Night City Resident*`,
        colors.info
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
}