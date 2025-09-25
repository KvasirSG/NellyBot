# Betterstack Integration Setup Guide

This guide covers setting up Betterstack logging and heartbeat monitoring for NellyBot.

## Prerequisites

- Node.js 16.9.0 or higher
- A [Better Stack](https://betterstack.com/) account (free tier available)

## Quick Setup

### 1. Enable Betterstack Integration

In your `.env` file:

```env
# Enable Betterstack integration
BETTERSTACK_ENABLED=true
```

### 2. Install Dependencies

```bash
npm install @logtail/node
```

### 3. Set up Logtail Logging (Optional)

1. Go to [Better Stack Logs](https://logtail.com/)
2. Create a new source for your NellyBot
3. Copy your source token
4. Add to `.env`:

```env
LOGTAIL_SOURCE_TOKEN=your_logtail_source_token_here
LOGTAIL_INGESTING_HOST=your_ingesting_host_here  # Optional
```

### 4. Set up Heartbeat Monitoring (Optional)

1. Go to **[Heartbeats](https://uptime.betterstack.com/team/0/heartbeats)** → **Create heartbeat**
2. Name your heartbeat — e.g. "NellyBot Discord Bot"
3. Set **Expect a heartbeat every** to 5-10 minutes
4. Configure the **grace period** (extra time before incident)
5. Configure **On-call escalation settings**
6. Click **Save heartbeat**
7. Copy the secret URL and add to `.env`:

```env
HEARTBEAT_URL=https://uptime.betterstack.com/api/v1/heartbeat/your_heartbeat_token_here
HEARTBEAT_INTERVAL=300000  # 5 minutes in milliseconds
```

## Verification

1. Start your bot: `npm start`
2. Use `/admin stats` command to verify configuration
3. Check Better Stack dashboard for logs and heartbeats

## Disabling Betterstack

To disable all Betterstack features:

```env
BETTERSTACK_ENABLED=false
```

The bot will fall back to console logging automatically.

## Troubleshooting

### Logs not appearing in Better Stack
- Verify your `LOGTAIL_SOURCE_TOKEN` is correct
- Check that `BETTERSTACK_ENABLED=true`
- Ensure network connectivity to Better Stack

### Heartbeat not working
- Verify your `HEARTBEAT_URL` is correct
- Check the heartbeat configuration in Better Stack dashboard
- Use `/admin stats` to see heartbeat status

### Console shows "using console fallback"
This is normal when:
- `BETTERSTACK_ENABLED=false`
- `LOGTAIL_SOURCE_TOKEN` is not configured
- You're running in development without Betterstack setup

## Advanced Configuration

### Custom Ingesting Host
If you have a custom ingesting host:

```env
LOGTAIL_INGESTING_HOST=your-custom-host.com
```

### Custom Heartbeat Interval
Default is 5 minutes (300000ms). To change:

```env
HEARTBEAT_INTERVAL=600000  # 10 minutes
```

### Manual Error Reporting
In your custom code:

```javascript
const heartbeat = require('./utils/heartbeat');
const logtail = require('./utils/logger');

// Log structured data
logtail.info('Custom event', {
    user: interaction.user.id,
    action: 'custom_action'
});

// Report critical failures
await heartbeat.reportFailure('Custom error occurred', 1);
```

## Need Help?

- [Better Stack Documentation](https://betterstack.com/docs)
- [Better Stack Community](https://betterstack.com/community)
- [NellyBot Issues](https://github.com/northenfreyja/NellyBot/issues)