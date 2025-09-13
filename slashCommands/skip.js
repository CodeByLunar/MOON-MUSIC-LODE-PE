const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song")
    .addIntegerOption(option =>
      option.setName("position")
        .setDescription("Position in the queue to skip to")
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const yes =  "<:YellowTick:1331401568016400420>"
    const no = "<:yellowx:1331401471178182776>"
    const player = await interaction.client.getPlayer(interaction.guild.id);

    if (player.queue.length == 0 && !player.data.get("autoplay")) {
      let emb = new interaction.client.embed().desc(
        `${no} **No more songs left in the queue to skip**`
      );
      return interaction.reply({ embeds: [emb] });
    }

    const position = interaction.options.getInteger("position");

    if (position) {
      if (!position || position < 0 || position > player.queue.length) {
        return interaction.reply({
          embeds: [
            new interaction.client.embed().desc(
              `${no} **Invalid queue position provided**`
            ),
          ],
        });
      }
      if (position == 1) player.skip();
      
      player.queue.splice(0, position - 1);
    }

    await player.skip();

    let emb = new interaction.client.embed().desc(
      `${yes} **Skipped** [${player.queue.current.title
        .replace("[", "")
        .replace("]", "")}]`
    );
    return interaction.reply({ embeds: [emb] });
  },
};
