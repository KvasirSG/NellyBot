/**
 * Permission utility functions for bot ownership and admin checks
 */

/**
 * Check if a user is the bot owner or team member
 * @param {Client} client - Discord client instance
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if user is owner or team member
 */
async function isOwner(client, userId) {
    try {
        // Fetch the application to get owner information
        const application = await client.application.fetch();

        // Check if user is the individual owner
        if (application.owner?.id === userId) {
            return true;
        }

        // Check if the application belongs to a team
        if (application.owner?.members) {
            // It's a team - check if user is a team member
            return application.owner.members.has(userId);
        }

        return false;
    } catch (error) {
        console.error('Error checking bot ownership:', error);
        return false;
    }
}

/**
 * Check if a user has admin permissions in the current guild
 * @param {Interaction} interaction - Discord interaction
 * @returns {boolean} True if user has admin permissions
 */
function isGuildAdmin(interaction) {
    if (!interaction.guild) return false;

    const member = interaction.member;
    if (!member) return false;

    // Check for Administrator permission
    return member.permissions.has('Administrator');
}

/**
 * Check if a user can manage the bot (owner or guild admin)
 * @param {Client} client - Discord client instance
 * @param {Interaction} interaction - Discord interaction
 * @returns {Promise<boolean>} True if user can manage the bot
 */
async function canManageBot(client, interaction) {
    const userId = interaction.user.id;

    // Check if user is bot owner/team member
    const ownerCheck = await isOwner(client, userId);
    if (ownerCheck) return true;

    // Check if user has admin permissions in guild
    return isGuildAdmin(interaction);
}

/**
 * Check if a user is a bot owner/team member (strict check)
 * @param {Client} client - Discord client instance
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True only if user is actual bot owner/team member
 */
async function isStrictOwner(client, userId) {
    return await isOwner(client, userId);
}

module.exports = {
    isOwner,
    isGuildAdmin,
    canManageBot,
    isStrictOwner
};