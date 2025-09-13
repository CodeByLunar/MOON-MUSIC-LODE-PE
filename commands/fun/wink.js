/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "wink",
  aliases: [],
  category: "fun",
  description: "Wink at someone! 😉",
  args: false,
  usage: "wink [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const winkGif = await anime.wink();

      // Self-wink message handling
      let description = sender.id === targetUser.id
        ? `${sender} winks at themselves in the mirror... confidence! 😏`
        : `${sender} winks at ${targetUser}! 😉✨`;

      const embed = new EmbedBuilder()
        .setColor("#ffcc33")
        .setDescription(description)
        .setImage(winkGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // "Wink Again!" Button
      const winkAgainBtn = new ButtonBuilder()
        .setCustomId("wink_again")
        .setLabel("Wink Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(winkAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "wink_again") {
          const newWinkGif = await anime.wink();
          let newDescription = sender.id === targetUser.id
            ? `${sender} keeps winking at themselves... stylish! 😎`
            : `${sender} gives ${targetUser} another playful wink! 😉✨`;

          const newEmbed = new EmbedBuilder()
            .setColor("#ffcc33")
            .setDescription(newDescription)
            .setImage(newWinkGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in wink command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};