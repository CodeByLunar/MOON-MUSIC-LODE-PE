/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue")
    .addIntegerOption(option => 
      option.setName("position")
        .setDescription("The position of the song in the queue")
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);

    if (!player || !player.queue.length) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No songs in the queue!**`
          ),
        ],
        ephemeral: true,
      });
    }

    const position = interaction.options.getInteger("position") - 1;
    const track = player.queue[position];

    if (position >= player.queue.length || !track) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No song in queue at position ${position + 1}**`
          ),
        ],
        ephemeral: true,
      });
    }

    await player.queue.splice(position, 1);

    return interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.yes} **Removed [${track.title}](https://discord.gg/lode-pe-moon-music) from the queue.**`
        ),
      ],
    });
  },
};