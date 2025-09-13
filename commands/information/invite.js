/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  cooldown: "",
  category: "information",
  usage: "",
  description: "Shows bot's invite link with additional options",
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
    const supportServer = "https://discord.gg/lode-pe-moon-music";
    const website = "https://www.google.com";

    await message
      .reply({
        embeds: [
          new client.embed()
            .setTitle(`Invite & Support`)
            .setDescription(
              `Hey **${message.author.username}**, I'm **${client.user.username}**! \n` +
              `I'm a powerful bot with tons of features! Use the buttons below to invite me, join our support server, or check out our website.\n\n` +
              `<:Admin:1352638776391761961> **Admin Invite** → *Full permissions for advanced management.*\n` +
              `<a:perms:1352638973813461115> **Required Perms Invite** → *Only necessary permissions for general usage.*`
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setColor("#2F3136")
            .setFooter({
              text: "Powered by Team Pookie 🚀",
              iconURL: client.user.displayAvatarURL(),
            }),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new client.button().link("Admin Invite", client.invite.admin),
            new client.button().link("Required Perms", client.invite.required),
            new client.button().link("Website(soon)", website),
            new client.button().link("Support Server", supportServer)
          ),
        ],
      })
      .catch(() => {});
  },
};
