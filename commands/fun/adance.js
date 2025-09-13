/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "adance",
  aliases: [],
  category: "fun",
  description: "Dance with someone! 💃🕺",
  args: false,
  usage: "adance [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const danceGif = await anime.dance();

      const embed = new EmbedBuilder()
        .setColor("#ffcc33")
        .setDescription(`${sender} dances with ${targetUser}! 💃🕺`)
        .setImage(danceGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // Button to dance again
      const danceAgainBtn = new ButtonBuilder()
        .setCustomId("dance_again")
        .setLabel("Dance Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(danceAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "dance_again") {
          const newDanceGif = await anime.dance();
          const newEmbed = new EmbedBuilder()
            .setColor("#ffcc33")
            .setDescription(`${sender} keeps dancing with ${targetUser}! 🎶💃`)
            .setImage(newDanceGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in adance command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};