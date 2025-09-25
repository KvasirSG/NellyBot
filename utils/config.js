/**
 * Configuration utilities for the Discord bot
 */

/**
 * Check if Betterstack integration is enabled
 * @returns {boolean} True if Betterstack integration is enabled
 */
function isBetterstackEnabled() {
    return process.env.BETTERSTACK_ENABLED !== 'false';
}

/**
 * Get Betterstack configuration status
 * @returns {Object} Configuration status object
 */
function getBetterstackConfig() {
    const enabled = isBetterstackEnabled();

    return {
        enabled,
        logtail: {
            configured: enabled && !!process.env.LOGTAIL_SOURCE_TOKEN,
            token: enabled ? !!process.env.LOGTAIL_SOURCE_TOKEN : false,
            host: enabled ? !!process.env.LOGTAIL_INGESTING_HOST : false
        },
        heartbeat: {
            configured: enabled && !!process.env.HEARTBEAT_URL,
            url: enabled ? !!process.env.HEARTBEAT_URL : false,
            interval: enabled ? (parseInt(process.env.HEARTBEAT_INTERVAL) || 300000) : null
        }
    };
}

module.exports = {
    isBetterstackEnabled,
    getBetterstackConfig
};