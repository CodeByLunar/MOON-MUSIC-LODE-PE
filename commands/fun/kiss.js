/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "kiss",
  aliases: [],
  category: "fun",
  description: "Give someone a sweet kiss! 😘",
  args: false,
  usage: "kiss [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const kissGif = await anime.kiss();

      // Self-kiss message handling
      let description = sender.id === targetUser.id
        ? `${sender} blows a kiss to themselves... self-love is important! ❤️`
        : `${sender} gives ${targetUser} a sweet kiss! 😘💋`;

      const embed = new EmbedBuilder()
        .setColor("#ff66b2")
        .setDescription(description)
        .setImage(kissGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // "Kiss Again!" Button
      const kissAgainBtn = new ButtonBuilder()
        .setCustomId("kiss_again")
        .setLabel("Kiss Again!")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(kissAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "kiss_again") {
          const newKissGif = await anime.kiss();
          let newDescription = sender.id === targetUser.id
            ? `${sender} keeps sending kisses to themselves... so much confidence! 😍`
            : `${sender} gives ${targetUser} another sweet kiss! 💋✨`;

          const newEmbed = new EmbedBuilder()
            .setColor("#ff66b2")
            .setDescription(newDescription)
            .setImage(newKissGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in kiss command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};