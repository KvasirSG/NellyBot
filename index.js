require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const logtail = require('./utils/logger');
const heartbeat = require('./utils/heartbeat');
const Database = require('./database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const db = new Database();
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        logtail.info(`🔧 Loaded command: ${command.data.name}`, { command: command.data.name });
    } else {
        logtail.warn(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`, { filePath });
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client, db));
    }
    logtail.info(`📡 Loaded event: ${event.name}`, { event: event.name });
}

// Register slash commands
async function deployCommands() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        logtail.info('🔄 Started refreshing application (/) commands.');

        // Register commands to specific guild for faster updates during development
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            logtail.info('✅ Successfully reloaded application (/) commands for development guild.', { guildId: process.env.GUILD_ID });
        } else {
            // Register globally if no guild ID specified
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            logtail.info('✅ Successfully reloaded application (/) commands globally.');
        }
    } catch (error) {
        logtail.error('❌ Error deploying commands:', error);
    }
}

// Enhanced ready event
client.once('clientReady', async () => {
    logtail.info(`🤖 ${client.user.tag} is now online in Night City!`, {
        bot: client.user.tag,
        guilds: client.guilds.cache.size,
        users: client.users.cache.size
    });
    logtail.info('🔌 Cyberpunk RPG Bot initialized');
    logtail.info(`📊 Monitoring ${client.guilds.cache.size} server(s)`, { guilds: client.guilds.cache.size });
    logtail.info(`👥 Serving ${client.users.cache.size} users`, { users: client.users.cache.size });

    // Set bot status
    client.user.setPresence({
        activities: [{ name: 'Night City Chronicles', type: 0 }],
        status: 'online',
    });

    await deployCommands();

    // Start heartbeat monitoring
    heartbeat.start();
});

// Enhanced error handling
client.on('error', error => {
    logtail.error('🚨 Discord client error:', error);
    heartbeat.reportFailure(`Discord client error: ${error.message}`, 1).catch(console.error);
});

process.on('unhandledRejection', error => {
    logtail.error('🚨 Unhandled promise rejection:', error);
    heartbeat.reportFailure(`Unhandled promise rejection: ${error.message}`, 2).catch(console.error);
});

// Graceful shutdown
const gracefulShutdown = () => {
    logtail.info('🔌 Disconnecting from the matrix...');
    heartbeat.stop();
    logtail.flush();
    db.close();
    client.destroy();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    logtail.error('❌ Failed to login:', error);
    heartbeat.reportFailure(`Failed to login: ${error.message}`, 3).catch(console.error);
    logtail.flush();
    process.exit(1);
});