require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
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
        console.log(`🔧 Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
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
    console.log(`📡 Loaded event: ${event.name}`);
}

// Register slash commands
async function deployCommands() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Started refreshing application (/) commands.');

        // Register commands to specific guild for faster updates during development
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('✅ Successfully reloaded application (/) commands for development guild.');
        } else {
            // Register globally if no guild ID specified
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log('✅ Successfully reloaded application (/) commands globally.');
        }
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}

// Enhanced ready event
client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} is now online in Night City!`);
    console.log('🔌 Cyberpunk RPG Bot initialized');
    console.log(`📊 Monitoring ${client.guilds.cache.size} server(s)`);
    console.log(`👥 Serving ${client.users.cache.size} users`);

    // Set bot status
    client.user.setPresence({
        activities: [{ name: 'Night City Chronicles', type: 0 }],
        status: 'online',
    });

    await deployCommands();
});

// Enhanced error handling
client.on('error', error => {
    console.error('🚨 Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('🚨 Unhandled promise rejection:', error);
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('🔌 Disconnecting from the matrix...');
    db.close();
    client.destroy();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});