/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the player volume")
    .addIntegerOption(option =>
      option
        .setName("level")
        .setDescription("Volume level (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
    ),

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

    const volume = interaction.options.getInteger("level");
    
    if (!volume) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.bell} **Current player volume: \`[ ${player.volume * 100}% ]\`**`
          ),
        ],
      });
    }

    await player.setVolume(volume);
    await interaction.client.sleep(500);

    return interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.yes} **Volume set to: \`[ ${volume}% ]\`**`
        ),
      ],
    });
  },
};