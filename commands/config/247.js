/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "247",
  aliases: [],
  category: "config",
  description: "Enable/Disable 24/7 mode",
  botPerms: [],
  userPerms: [],
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  execute: async (client, message, args, emoji) => {
    const player = await client.getPlayer(message.guild.id);
    let data = await client.db.twoFourSeven.get(`${client.user.id}_${message.guild.id}`);

    if (data) {
      // If 24/7 is already enabled, show embed with "Disable" button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("disable_247")
          .setLabel("Disable 24/7")
          .setStyle(ButtonStyle.Danger)
      );

      const m = await message.reply({
        embeds: [new client.embed().desc(`${emoji["247"]} **24/7 mode is already enabled.**\nClick below to disable.`)],
        components: [row],
      }).catch(() => {});

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = m.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        await client.db.twoFourSeven.delete(`${client.user.id}_${message.guild.id}`);

        await m.edit({
          embeds: [new client.embed().desc(`${emoji.off} **24/7 mode is now \`Disabled\`**`)],
          components: [],
        }).catch(() => {});

        collector.stop();
      });

      collector.on("end", async () => {
        await m.edit({ components: [] }).catch(() => {});
      });

    } else {
      // If 24/7 is disabled, enable it directly
      await client.db.twoFourSeven.set(`${client.user.id}_${message.guild.id}`, {
        TextId: player.textId,
        VoiceId: player.voiceId,
      });

      await message.reply({
        embeds: [new client.embed().desc(`${emoji.on} **24/7 mode is now \`Enabled\`**`)],
      }).catch(() => {});
    }
  },
};
