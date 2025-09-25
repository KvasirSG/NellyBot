const https = require('https');
const http = require('http');
const { URL } = require('url');
const logtail = require('./logger');

class HeartbeatMonitor {
    constructor() {
        // Check if Betterstack integration is enabled
        const isBetterstackEnabled = process.env.BETTERSTACK_ENABLED !== 'false';

        this.heartbeatURL = process.env.HEARTBEAT_URL;
        this.interval = parseInt(process.env.HEARTBEAT_INTERVAL) || 300000; // Default 5 minutes
        this.intervalId = null;
        this.isEnabled = isBetterstackEnabled && !!this.heartbeatURL;

        if (!this.isEnabled) {
            const reason = !isBetterstackEnabled ? 'Betterstack integration disabled' : 'no HEARTBEAT_URL configured';
            logtail.info(`💓 Heartbeat monitoring disabled - ${reason}`);
        } else {
            logtail.info('💓 Heartbeat monitoring initialized', {
                interval: this.interval / 1000 + ' seconds',
                url: this.maskURL(this.heartbeatURL)
            });
        }
    }

    /**
     * Mask sensitive parts of the heartbeat URL for logging
     */
    maskURL(url) {
        if (!url) return 'Not configured';
        try {
            const parsed = new URL(url);
            const pathParts = parsed.pathname.split('/');
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart.length > 8) {
                    pathParts[pathParts.length - 1] = lastPart.substring(0, 4) + '****' + lastPart.substring(lastPart.length - 4);
                }
            }
            parsed.pathname = pathParts.join('/');
            return parsed.toString();
        } catch (error) {
            return 'Invalid URL format';
        }
    }

    /**
     * Send a heartbeat ping to Better Stack
     */
    async ping(data = null) {
        if (!this.isEnabled) return;

        return new Promise((resolve, reject) => {
            try {
                const url = new URL(this.heartbeatURL);
                const isHttps = url.protocol === 'https:';
                const client = isHttps ? https : http;

                const options = {
                    hostname: url.hostname,
                    port: url.port || (isHttps ? 443 : 80),
                    path: url.pathname + url.search,
                    method: data ? 'POST' : 'GET',
                    timeout: 10000,
                    headers: data ? {
                        'Content-Type': 'text/plain',
                        'Content-Length': Buffer.byteLength(data)
                    } : {}
                };

                const req = client.request(options, (res) => {
                    let responseData = '';
                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            logtail.info('💓 Heartbeat sent successfully', { statusCode: res.statusCode });
                            resolve({ success: true, statusCode: res.statusCode, data: responseData });
                        } else {
                            logtail.warn('💓 Heartbeat received non-success status', {
                                statusCode: res.statusCode,
                                response: responseData
                            });
                            resolve({ success: false, statusCode: res.statusCode, data: responseData });
                        }
                    });
                });

                req.on('error', (error) => {
                    logtail.error('💓 Heartbeat request failed', {
                        error: error.message,
                        code: error.code
                    });
                    reject(error);
                });

                req.on('timeout', () => {
                    req.destroy();
                    const timeoutError = new Error('Heartbeat request timed out');
                    logtail.error('💓 Heartbeat request timed out');
                    reject(timeoutError);
                });

                if (data) {
                    req.write(data);
                }

                req.end();
            } catch (error) {
                logtail.error('💓 Heartbeat setup error', { error: error.message });
                reject(error);
            }
        });
    }

    /**
     * Report a failure to Better Stack heartbeat
     */
    async reportFailure(errorMessage = '', exitCode = null) {
        if (!this.isEnabled) return;

        try {
            // Append /fail to the heartbeat URL
            const failURL = this.heartbeatURL + '/fail';

            // If we have an exit code, append it to the URL
            const finalURL = exitCode !== null ? this.heartbeatURL + '/' + exitCode : failURL;

            const url = new URL(finalURL);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: errorMessage ? 'POST' : 'GET',
                timeout: 10000,
                headers: errorMessage ? {
                    'Content-Type': 'text/plain',
                    'Content-Length': Buffer.byteLength(errorMessage)
                } : {}
            };

            return new Promise((resolve, reject) => {
                const req = client.request(options, (res) => {
                    let responseData = '';
                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        logtail.warn('💓 Failure reported to heartbeat', {
                            statusCode: res.statusCode,
                            exitCode,
                            errorMessage: errorMessage ? errorMessage.substring(0, 100) + '...' : 'No message'
                        });
                        resolve({ success: true, statusCode: res.statusCode, data: responseData });
                    });
                });

                req.on('error', (error) => {
                    logtail.error('💓 Failed to report failure to heartbeat', { error: error.message });
                    reject(error);
                });

                if (errorMessage) {
                    req.write(errorMessage);
                }

                req.end();
            });
        } catch (error) {
            logtail.error('💓 Error setting up failure report', { error: error.message });
            throw error;
        }
    }

    /**
     * Start periodic heartbeat monitoring
     */
    start() {
        if (!this.isEnabled) {
            logtail.info('💓 Heartbeat monitoring not started - disabled');
            return;
        }

        if (this.intervalId) {
            logtail.warn('💓 Heartbeat monitoring already running');
            return;
        }

        // Send initial heartbeat
        this.ping().catch(error => {
            logtail.error('💓 Initial heartbeat failed', { error: error.message });
        });

        // Set up periodic heartbeats
        this.intervalId = setInterval(() => {
            this.ping().catch(error => {
                logtail.error('💓 Periodic heartbeat failed', { error: error.message });
            });
        }, this.interval);

        logtail.info('💓 Heartbeat monitoring started', {
            intervalSeconds: this.interval / 1000
        });
    }

    /**
     * Stop periodic heartbeat monitoring
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logtail.info('💓 Heartbeat monitoring stopped');
        }
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            running: !!this.intervalId,
            interval: this.interval,
            url: this.maskURL(this.heartbeatURL)
        };
    }
}

// Export singleton instance
module.exports = new HeartbeatMonitor();