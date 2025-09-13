/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "cuddle",
  aliases: [],
  category: "fun",
  description: "Cuddle with someone! 🥰",
  args: false,
  usage: "cuddle [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const cuddleGif = await anime.cuddle();

      const embed = new EmbedBuilder()
        .setColor("#ff99cc")
        .setDescription(`${sender} cuddles ${targetUser}! 🥰`)
        .setImage(cuddleGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // Button to cuddle again
      const cuddleAgainBtn = new ButtonBuilder()
        .setCustomId("cuddle_again")
        .setLabel("Cuddle Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(cuddleAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "cuddle_again") {
          const newCuddleGif = await anime.cuddle();
          const newEmbed = new EmbedBuilder()
            .setColor("#ff99cc")
            .setDescription(`${sender} cuddles ${targetUser} even more! 💞`)
            .setImage(newCuddleGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in cuddle command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};