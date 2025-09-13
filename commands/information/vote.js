/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "vote",
    aliases: [],
    cooldown: "",
    category: "information",
    usage: "",
    description: "Shows bot's vote link",
    args: false,
    vote: false,
    new: false,
    admin: false,
    owner: false,
    botPerms: [],
    userPerms: [],
    player: false,
    queue: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    execute: async (client, message, args, emoji) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Click here to vote for me")
                    .setURL("https://top.gg/bot/1281872745113587752")
                    .setStyle(ButtonStyle.Link)
            );

        await message.reply({
            embeds: [
                new client.embed().desc(
                    `${emoji.vote} **Loved My Music? If yes then Consider Voting Me In top.gg**`
                ),
            ],
            components: [row],
        });
    },
};