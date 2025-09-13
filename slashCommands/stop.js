/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the player and clear the queue"),

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

    player.queue.clear();
    player.data.delete("autoplay");
    player.loop = "none";
    player.playing = false;
    player.paused = false;
    await player.skip();
    await interaction.client.sleep(500);

    let emb = new interaction.client.embed().desc(
      `${interaction.client.emoji.yes} **Stopped and destroyed the player**`
    );

    return interaction.reply({ embeds: [emb] });
  },
};