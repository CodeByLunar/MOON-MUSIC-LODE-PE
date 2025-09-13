module.exports = {
  name: "sleave",
  aliases: [],
  cooldown: "",
  category: "owner",
  usage: "<server_id>",
  description: "Leave a server by ID",
  args: true,
  vote: false,
  new: false,
  admin: true,
  owner: true,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args, emoji = { yes: "✅", no: "❌" }) => { 
    if (!args[0]) {
      return message.reply({
        embeds: [
          new client.embed().desc(`${emoji.no} **Please provide a Server ID**`),
        ],
      });
    }

    const guild = client.guilds.cache.get(args[0]);

    if (!guild) {
      return message.reply({
        embeds: [
          new client.embed().desc(`${emoji.no} **Invalid Server ID or bot is not in that server**`),
        ],
      });
    }

    try {
      await guild.leave();
      message.reply({
        embeds: [
          new client.embed().desc(`${emoji.yes} **Successfully left the server: ${guild.name}**`),
        ],
      });

      await client.webhooks.static?.send({
        username: client.user.username,
        avatarURL: client.user.displayAvatarURL(),
        embeds: [
          new client.embed()
            .desc(
              `**Left Server:** ${guild.name} (${guild.id})\n` +
              `**Requested by:** ${message.author.tag} (${message.author.id})`
            )
            .setColor("#ff0000"),
        ],
      }).catch(() => {});
    } catch (error) {
      console.error(error);
      message.reply({
        embeds: [
          new client.embed().desc(`${emoji.no} **Failed to leave the server**`),
        ],
      });
    }
  },
};