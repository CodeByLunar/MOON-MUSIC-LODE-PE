/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "pat",
  aliases: [],
  category: "fun",
  description: "Pat someone on the head! 🖐️",
  args: false,
  usage: "pat [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const patGif = await anime.pat();

      // Prevent self-patting message
      let description = sender.id === targetUser.id
        ? `${sender} patted themselves... self-love is important! ❤️`
        : `${sender} gently pats ${targetUser} on the head! 🖐️`;

      const embed = new EmbedBuilder()
        .setColor("#ffcc99")
        .setDescription(description)
        .setImage(patGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // "Pat Again" Button
      const patAgainBtn = new ButtonBuilder()
        .setCustomId("pat_again")
        .setLabel("Pat Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(patAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "pat_again") {
          const newPatGif = await anime.pat();
          let newDescription = sender.id === targetUser.id
            ? `${sender} keeps patting themselves... they really need love! 🥰`
            : `${sender} gives ${targetUser} even more pats! ✋✨`;

          const newEmbed = new EmbedBuilder()
            .setColor("#ffcc99")
            .setDescription(newDescription)
            .setImage(newPatGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in pat command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};