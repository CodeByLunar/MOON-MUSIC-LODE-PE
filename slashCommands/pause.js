const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the music player"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);
    const yes =  "<:YellowTick:1331401568016400420>"
    const no = "<:yellowx:1331401471178182776>"
    if (player.shoukaku.paused) {
      let emb = new interaction.client.embed().desc(
        `${no} **The player is already paused**`
      );
      return interaction.reply({ embeds: [emb] });
    }

    await player.pause(true);
    await updateEmbed(interaction.client, player);
    
    let emb = new interaction.client.embed().desc(
      `${yes} **Paused the player**`
    );
    return interaction.reply({ embeds: [emb] });
  },
};
