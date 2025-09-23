# JavaScript quick start guide

Where do you want to collect your JavaScript logs from?

- [Node.js backend only](#logging-from-node-js)
- [Browser only](#logging-from-browser)
- [Both browser and Node.js backend](#logging-from-browser-and-node-js)

## Logging from Node.js

Collect logs from the backend code of your application.

### 1. Install

Install Logtail Node NPM package:

```bash
[label Install Logtail Node]
npm install @logtail/node
```

### 2. Setup

Set up Logtail client:

```javascript
[label Set up Logtail]
const { Logtail } = require("@logtail/node");
const logtail = new Logtail("$SOURCE_TOKEN", {
  endpoint: 'https://$INGESTING_HOST',
});
```



### 3. Start logging 🎉

```javascript
[label Send logs to Logtail]
logtail.error("Something bad happend.");
logtail.info("Log message with structured data.", {
    item: "Orange Soda",
    price: 100.00
});

// Ensure that all logs are sent to Logtail
logtail.flush()
```

You should see your logs in [Better Stack → Live tail](https://logtail.com/team/0/tail ";_blank").

[warning]
**Node.js version 12 or higher is required.**
[/warning]


## Logging from browser

Collect logs from your frontend code.

### 1. Install

Install Logtail Browser NPM package:

```bash
[label Install Logtail Browser]
npm install @logtail/browser
```

### 2. Setup

Set up Logtail client:

```javascript
[label Set up Logtail]
import { Logtail } from "@logtail/browser";
const logtail = new Logtail("$SOURCE_TOKEN", {
  endpoint: 'https://$INGESTING_HOST',
});
```



**Prefer using a Content Delivery Network?**
Add Logtail import to your HTML page:

```html
[label Import Logtail]
<script src="https://cdnjs.cloudflare.com/ajax/libs/logtail-browser/0.4.19/dist/umd/logtail.min.js" integrity="sha512-EYdnWL7Lrn+96R4BDaOxCgCWWOoZQiMSsfy+3NKYSJxK/CAt6y7cPLvGHRWONYO8Y0SsGuk5Y+lC1w3up7f7OA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
```

### 3. Start logging 🎉

```javascript
[label Send logs to Logtail]
logtail.error("Something bad happend.");
logtail.info("Log message with structured data.", {
    item: "Orange Soda",
    price: 100.00
});

// Ensure that all logs are sent to Logtail
logtail.flush()
```

You should see your logs in [Better Stack → Live tail](https://logtail.com/team/0/tail ";_blank").

## Logging from browser and Node.js

Collect logs from both backend and frontend code of your Node.js application.


### 1. Install

Install Logtail JavaScript NPM package:

```bash
[label Install Logtail JS]
npm install @logtail/js
```

### 2. Setup

Set up Logtail client in backend and frontend code:

[code-tabs]
```javascript
[label Backend code]
const { Node: Logtail } = require("@logtail/js");
const logtail = new Logtail("$SOURCE_TOKEN", {
  endpoint: 'https://$INGESTING_HOST',
});
```
```javascript
[label Frontend code]
import { Browser as Logtail } from "@logtail/js";
const logtail = new Logtail("$SOURCE_TOKEN", {
  endpoint: 'https://$INGESTING_HOST',
});
```
[/code-tabs]



### 3. Start logging 🎉

Log the same way in backend and frontend:

```javascript
[label Send logs to Better Stack]
logtail.error("Something bad happend.");
logtail.info("Log message with structured data.", {
    item: "Orange Soda",
    price: 100.00
});

// Ensure that all logs are sent to Logtail
logtail.flush()
```

You should see your logs in [Better Stack → Live tail](https://logtail.com/team/0/tail ";_blank").

[warning]
**Node.js version 12 or higher is required.**
[/warning]

## Need help?

Please let us know at hello@betterstack.com.
We're happy to help! 🙏

## Additional information

- Want to learning more about **log levels** and **middleware** in Node.js?
Continue to the [Advanced usage of Better Stack JavaScript client](https://betterstack.com/docs/logs/javascript/logging/).

- New to logging? See the [Intro guide to Node.js logging](https://betterstack.com/community/guides/logging/how-to-start-logging-with-node-js/) and the [Best practices for logging in Node.js](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/).

- Logging from browser? Some browsers (e.g. Brave, or some browser extensions) may block your logs from being sent. If you need to work around this issue, see [possible workarounds on Github](https://github.com/logtail/logtail-js/issues/74).

- Using [Bun](https://bun.sh) runtime? No worries, our logging packages are tested in Bun as well as Node.

- Using helper function for logging in Node.js? You can fix the logged `context.runtime` info by passing `stackContextHint` to the logger. See the [usage in example project](https://github.com/logtail/logtail-js/blob/master/example-project/index.js#L59) to learn more.

### NPM packages

Package [@logtail/js](https://www.npmjs.com/package/@logtail/js) provides a convenient way to install and manage both [@logtail/node](https://www.npmjs.com/package/@logtail/node) and [@logtail/browser](https://www.npmjs.com/package/@logtail/browser) NPM packages.
You can install the packages separately if you wish to.

---

# Cron and heartbeat monitor

A heartbeat monitor helps you track periodic tasks by expecting regular requests to a unique URL.

If the expected heartbeat is not received within the specified frequency and grace period, it triggers an incident and alerts the configured on-call team.

[info]
#### Getting started with heartbeats?
Start with our [Introduction to cron job monitoring](https://betterstack.com/community/guides/monitoring/what-is-cron-monitoring/ ";_blank") or [Getting started with cron jobs guide](https://betterstack.com/community/guides/linux/cron-jobs-getting-started/ ";_blank").
[/info]

## Step-by-step setup

1. Go to **[Heartbeats](https://uptime.betterstack.com/team/0/heartbeats)** → **Create heartbeat**.
2. Name your heartbeat — e.g. "NellyBot Discord Bot".
3. Set the **Expect a heartbeat every** field to match the frequency of your monitoring (we recommend 5-10 minutes).
4. Configure the **grace period**, which is the extra time allowed before an incident is raised if the heartbeat is missed.
5. Configure the **On-call escalation settings**.
6. Click **Save heartbeat**.
7. Copy the secret URL on the heartbeat detail page; you'll need it in your `.env` file.

[note]
#### Heartbeat remains pending until the first request
The heartbeat remains in a "Pending" state until the first request is received. The monitoring period begins from the first heartbeat received, and incidents are only raised after the **expected frequency** and **grace period** have elapsed.
[/note]

## Environment Configuration

Add these variables to your `.env` file:

```env
[label Environment variables for heartbeat monitoring]
# Better Stack Heartbeat monitoring
HEARTBEAT_URL=https://uptime.betterstack.com/api/v1/heartbeat/your_heartbeat_token_here
HEARTBEAT_INTERVAL=300000  # 5 minutes in milliseconds
```

## How it works in NellyBot

The bot automatically:

- **Sends periodic heartbeats** every 5 minutes (configurable)
- **Reports failures** when critical errors occur:
  - Discord client errors (exit code 1)
  - Unhandled promise rejections (exit code 2)
  - Login failures (exit code 3)
- **Stops monitoring** during graceful shutdown
- **Shows status** in `/admin stats` command

## Reporting failures manually

You can also report failures manually in your code:

```javascript
[label Manual failure reporting]
const heartbeat = require('./utils/heartbeat');

// Report a failure with a message
await heartbeat.reportFailure('Database connection lost');

// Report a failure with exit code
await heartbeat.reportFailure('Critical error occurred', 1);
```

## Monitoring your bot

Once configured, you can:

- **View real-time status** in Better Stack dashboard
- **Get alerts** when your bot goes down or encounters errors
- **Check heartbeat status** using `/admin stats` command in Discord
- **See detailed logs** in Better Stack Live tail for debugging