/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "punch",
  aliases: [],
  category: "fun",
  description: "Punch someone! 👊",
  args: false,
  usage: "punch [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const punchGif = await anime.punch();

      // Self-punch message handling
      let description = sender.id === targetUser.id
        ? `${sender} tried to punch themselves... why? 🤔`
        : `${sender} lands a strong punch on ${targetUser}! 👊💥`;

      const embed = new EmbedBuilder()
        .setColor("#ff3300")
        .setDescription(description)
        .setImage(punchGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // "Punch Again!" Button
      const punchAgainBtn = new ButtonBuilder()
        .setCustomId("punch_again")
        .setLabel("Punch Again!")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(punchAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "punch_again") {
          const newPunchGif = await anime.punch();
          let newDescription = sender.id === targetUser.id
            ? `${sender} punches themselves again... this is getting weird! 🥴`
            : `${sender} lands another punch on ${targetUser}! 💢👊`;

          const newEmbed = new EmbedBuilder()
            .setColor("#ff3300")
            .setDescription(newDescription)
            .setImage(newPunchGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in punch command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};