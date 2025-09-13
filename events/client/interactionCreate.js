/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isModalSubmit()) {
      switch (interaction.customId) {
        case "report":
          await client.emit("reportSubmit", interaction);
          break;

        default:
          break;
      }
      return;
    }

    if (interaction.isButton()) {
      let playerButtonIds = [
        `${interaction.guildId}play_pause`,
        `${interaction.guildId}previous`,
        `${interaction.guildId}skip`,
        `${interaction.guildId}stop`,
        `${interaction.guildId}autoplay`,
      ];
      if (playerButtonIds.includes(interaction.customId))
        return client.emit("playerButtonClick", interaction);
      return;
    }

    // 🎵 **NEW HANDLER**: Dropdown se song select hone pe turant play karega
    if (interaction.isStringSelectMenu()) {
      if (!interaction.customId.startsWith("select_upcoming_song")) return;

      const player = client.manager.get(interaction.guildId);
      if (!player) {
        return interaction.reply({ content: "No active player!", ephemeral: true });
      }

      const selectedValue = interaction.values[0];
      const song = await player.search(selectedValue);

      if (!song || !song.tracks.length) {
        return interaction.reply({ content: "Couldn't find the selected song!", ephemeral: true });
      }

      const selectedTrack = song.tracks[0];

      player.stop();
      player.play(selectedTrack);

      await interaction.reply({
        content: `🎵 Now playing: **${selectedTrack.title}**`,
        ephemeral: true,
      });
    }
  },
};
