/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("See what's currently being played"),

  async execute(interaction) {
    try {
      // Fetch the preset path from the database or use a default value
      const path =
        (await interaction.client.db.preset.get(`${interaction.client.user.id}_${interaction.guild.id}`)) ||
        `cards/card2.js`;

      // Get the player for the guild
      const player = await interaction.client.getPlayer(interaction.guild.id);
      if (!player || !player.queue.current) {
        return interaction.reply({
          embeds: [
            new interaction.client.embed().desc(
              `${interaction.client.emoji.no} **No song is currently playing!**`
            ),
          ],
          ephemeral: true,
        });
      }

      // Get the current track from the player's queue
      const track = player.queue.current;

      // Calculate the progress of the track
      const progress = track.isStream ? 50 : (player.position / track.length) * 100;

      // Get the requester of the track
      const requester = track.requester;

      // Load the preset and pass the necessary data
      const presetData = await require(`@presets/${path}`)(
        {
          title: track.title?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 25) || "Something Good",
          author: track.author?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 20) || "PainMoon Music",
          duration: track.isStream ? "◉ LIVE" : interaction.client.formatTime(track.length) || "06:09",
          thumbnail: track.thumbnail || interaction.client.user.displayAvatarURL({ format: "png" }),
          color: interaction.client.color || "#FFFFFF",
          progress: progress,
          source: track.sourceName !== "youtube" ? track.sourceName : "spotify",
          requester: requester,
        },
        interaction.client,
        player
      );

      // Send the embed and files as a reply to the interaction
      await interaction.reply({
        embeds: presetData[0],
        files: presetData[1],
      });
    } catch (error) {
      console.error("Error in nowplaying command:", error);
      // Optionally send an error message to the user
      await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **An error occurred while fetching the current song.**`
          ),
        ],
        ephemeral: true,
      });
    }
  },
};