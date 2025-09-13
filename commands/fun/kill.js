/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const anime = require("anime-actions");

module.exports = {
  name: "kill",
  aliases: [],
  category: "fun",
  description: "Kill someone with a brutal anime-style attack! 🔪",
  args: false,
  usage: "kill [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      const sender = message.author;
      const targetUser = message.mentions.users.first() || sender;
      const killGif = await anime.kill();

      // Prevent self-killing messages for fun
      let description = sender.id === targetUser.id
        ? `${sender} tried to kill themselves... but failed! 💀`
        : `${sender} 🔪 brutally killed ${targetUser}!`;

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(description)
        .setImage(killGif)
        .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

      // Button to kill again
      const killAgainBtn = new ButtonBuilder()
        .setCustomId("kill_again")
        .setLabel("Kill Again!")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(killAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === sender.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "kill_again") {
          const newKillGif = await anime.kill();
          let newDescription = sender.id === targetUser.id
            ? `${sender} keeps trying to kill themselves... but it's not working! 🤕`
            : `${sender} 🔪 executed ${targetUser} once again!`;

          const newEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setDescription(newDescription)
            .setImage(newKillGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in kill command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};