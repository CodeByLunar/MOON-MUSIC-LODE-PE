/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the currently paused player"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);

    if (!player) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No active player found!**`
          ),
        ],
        ephemeral: true,
      });
    }

    if (!player.shoukaku.paused) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **The player is not paused**`
          ),
        ],
        ephemeral: true,
      });
    }

    await player.pause(false);
    await updateEmbed(interaction.client, player);

    return interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.yes} **Resumed the player**`
        ),
      ],
    });
  },
};