const { EmbedBuilder } = require('discord.js');

const colors = {
    primary: 0x00ff9f,    // Neon green
    secondary: 0xff0080,  // Hot pink
    danger: 0xff3333,     // Red
    warning: 0xffaa00,    // Orange
    info: 0x00aaff,       // Blue
    success: 0x00cc44     // Green
};

function getRandomCyberpunkQuote() {
    const quotes = [
        "Welcome to Night City, choom.",
        "The net is vast and infinite.",
        "Chrome is the future, flesh is weak.",
        "Credits make the world go round in 2077.",
        "Stay frosty, netrunner.",
        "Another day, another eddies.",
        "The street finds its own uses for things.",
        "Wake the f*ck up, samurai.",
        "Preem work, samurai.",
        "Keep your eyes on the street.",
        "The future is now, old man."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function createCyberpunkEmbed(title, description, color = colors.primary) {
    return new EmbedBuilder()
        .setTitle(`🔮 ${title}`)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: getRandomCyberpunkQuote() })
        .setTimestamp();
}

module.exports = {
    colors,
    createCyberpunkEmbed,
    getRandomCyberpunkQuote
};