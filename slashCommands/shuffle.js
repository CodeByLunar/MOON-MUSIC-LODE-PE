/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (!player || !player.queue.length) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **The queue is empty!**`
          ),
        ],
        ephemeral: true,
      });
    }

    await player.queue.shuffle();

    let emb = new interaction.client.embed().desc(
      `${interaction.client.emoji.yes} **Shuffled the queue**`
    );

    await interaction.reply({ embeds: [emb] });

    // Optionally, execute the queue command to show the shuffled queue
    await interaction.client.commands
      .get("queue")
      .execute(interaction);
  },
};