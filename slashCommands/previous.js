/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play the previous song"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (!player || !player.queue.previous.length) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No previously played song found!**`
          ),
        ],
        ephemeral: true,
      });
    }

    // Move last played song back to queue
    const prevTrack = player.queue.previous[player.queue.previous.length - 1];
    player.queue.unshift(prevTrack);
    await player.skip();

    return interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.yes} **Playing previous [${prevTrack.title
            .replace("[", "")
            .replace("]", "")}](https://discord.gg/lode-pe-moon-music)**`
        ),
      ],
    });
  },
};