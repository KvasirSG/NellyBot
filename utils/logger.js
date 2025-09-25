const { Logtail } = require('@logtail/node');

let logtail = null;

// Check if Betterstack integration is enabled
const isBetterstackEnabled = process.env.BETTERSTACK_ENABLED !== 'false';

// Initialize logger with token and endpoint from environment
if (isBetterstackEnabled && process.env.LOGTAIL_SOURCE_TOKEN) {
    const config = {};

    if (process.env.LOGTAIL_INGESTING_HOST) {
        // Check if the host already includes https://
        const host = process.env.LOGTAIL_INGESTING_HOST;
        config.endpoint = host.startsWith('https://') ? host : `https://${host}`;
    }

    logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, config);
} else {
    // Fallback to console if Betterstack is disabled or no token provided
    const reason = !isBetterstackEnabled ? 'Betterstack integration disabled' : 'No Logtail token provided';
    console.log(`📝 Logger: Using console fallback (${reason})`);

    logtail = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
        flush: () => {}
    };
}

module.exports = logtail;