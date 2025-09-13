/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "cry",
  aliases: [],
  category: "fun",
  description: "Express sadness with a crying gif!",
  args: false,
  usage: "cry",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message) => {
    try {
      const sender = message.author;
      const cryGif = await anime.cry();

      const embed = new EmbedBuilder()
        .setColor("#0000ff")
        .setDescription(`${sender} is crying... 😢`)
        .setImage(cryGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      const cryAgainBtn = new ButtonBuilder()
        .setCustomId("cry_again")
        .setLabel("Cry Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(cryAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "cry_again") {
          const newCryGif = await anime.cry();
          const newEmbed = new EmbedBuilder()
            .setColor("#0000ff")
            .setDescription(`${sender} is crying even more! 😭`)
            .setImage(newCryGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in cry command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};