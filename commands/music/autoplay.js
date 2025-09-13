/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  cooldown: "",
  category: "music",
  usage: "",
  description: "en/dis-able autoplay",
  args: false,
  vote: false,
  new: true,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: true,
  queue: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args, emoji) => {
    let player = await client.getPlayer(message.guild.id);
    let data = player.data.get("autoplay");

    if (!data) {
      // Directly enable autoplay if it's disabled
      player.data.set("autoplay", true);
      let emb = new client.embed().desc(
        `${emoji.on} **Autoplay is now \`Enabled\`**\n` +
        `${emoji.bell} *Set by ${message.author.tag} - (Auto-enabled)*`,
      );
      await require("@functions/updateEmbed.js")(client, player);
      return await message.reply({ embeds: [emb] }).catch(() => {});
    }

    // If autoplay is already enabled, show buttons for disabling or canceling
    const row = new ActionRowBuilder().addComponents(
      new client.button().danger("disable", "Disable"),
      new client.button().secondary("cancel", "Cancel"),
    );

    const m = await message.reply({
      embeds: [
        new client.embed().desc(
          `${emoji.autoplay} **Autoplay is currently enabled. Do you want to disable it?**`,
        ),
      ],
      components: [row],
    }).catch(() => {});

    const filter = async (interaction) => {
      if (interaction.user.id === message.author.id) {
        return true;
      }
      await interaction.reply({
        embeds: [
          new client.embed().desc(
            `${emoji.no} Only **${message.author.tag}** can use this`,
          ),
        ],
        ephemeral: true,
      }).catch(() => {});
      return false;
    };

    const collector = m?.createMessageComponentCollector({
      filter: filter,
      time: 60000,
      idle: 30000 / 2,
    });

    collector?.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "disable") {
        player.data.set("autoplay", false);
        let emb = new client.embed().desc(
          `${emoji.off} **Autoplay is now \`Disabled\`**\n` +
          `${emoji.bell} *Set by ${message.author.tag} - (New config)*`,
        );
        await require("@functions/updateEmbed.js")(client, player);
        return await m.edit({ embeds: [emb], components: [] }).catch(() => {});
      }

      if (interaction.customId === "cancel") {
        let emb = new client.embed().desc(
          `${emoji.cool} **Autoplay remains \`Enabled\`**\n` +
          `${emoji.bell} *Action canceled by ${message.author.tag}*`,
        );
        return await m.edit({ embeds: [emb], components: [] }).catch(() => {});
      }
    });

    collector?.on("end", async (collected, reason) => {
      if (collected.size === 0) {
        await m.edit({
          embeds: [
            new client.embed().desc(
              `${emoji.cool} **Timed out! Autoplay remains \`Enabled\`**`,
            ),
          ],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
