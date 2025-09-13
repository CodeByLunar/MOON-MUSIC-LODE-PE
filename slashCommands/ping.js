const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("chakkar ladki ka babu bhaiya"),
    async execute(interaction) {
        await interaction.reply("Pong!");
    },
};