/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the current voice channel"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);

    if (!player) {
      return await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(`${interaction.client.emoji.no} **I'm not in a voice channel!**`),
        ],
        ephemeral: true,
      });
    }

    let id = player.voiceId;

    let m = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(`${interaction.client.emoji.cool} **Leaving <#${id}> . . .**`),
      ],
    });

    await player.destroy();

    await m
      ?.edit({
        embeds: [
          new interaction.client.embed().desc(`${interaction.client.emoji.no} **Left <#${id}>**`),
        ],
      })
      .catch(() => {});
  },
};