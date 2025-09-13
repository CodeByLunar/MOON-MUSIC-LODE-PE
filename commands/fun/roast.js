/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "roast",
  aliases: [],
  category: "fun",
  description: "Roast someone! 🔥",
  args: false,
  usage: "roast [@user]",
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args) => {
    try {
      let target = message.mentions.members.first() || message.author;
      
      const roasts = [
        "*Puts you in the oven.*",
        "You're so stupid.",
        "Sorry, I can't hear you over how annoying you are.",
        "Your IQ is lower than the Mariana Trench.",
        "Your family tree must be a cactus because everyone on it is a prick.",
        "Someday you will go far, and I hope you stay there.",
        "The zoo called. They're wondering how you got out of your cage.",
        "You are proof that evolution can go in reverse.",
        "Even monkeys can go to space, so clearly you lack some potential.",
        "You look like a monkey, and you smell like one too.",
        "I know a good joke! You!",
        "Is your ass jealous of the amount of shit that just came out of your mouth?",
        "Two wrongs don't make a right, take your parents as an example.",
        "Your birth certificate is an apology letter from the condom factory.",
        "You're so ugly, when your mom dropped you off at school, she got a fine for littering.",
        "If laughter is the best medicine, your face must be curing the world.",
        "You have a room temperature IQ - if the room is in Antarctica.",
        "I was going to give you a nasty look, but you already have one.",
        "You're the reason the gene pool needs a lifeguard.",
        "Calling you an idiot would be an insult to all stupid people.",
        "If I wanted to hear from an asshole, I'd fart.",
        "You look like a rock smashed into a pile of sand, rolled into a blunt, and got smoked through an asthma inhaler.",
      ];

      const roast = roasts[Math.floor(Math.random() * roasts.length)];

      const embed = new EmbedBuilder()
        .setColor("#ff6600")
        .setDescription(`🔥 **${target}, ${roast}**`)
        .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      // "Roast Again!" Button
      const roastAgainBtn = new ButtonBuilder()
        .setCustomId("roast_again")
        .setLabel("Roast Again!")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(roastAgainBtn);

      const m = await message.reply({ embeds: [embed], components: [row] });

      // Button Collector
      const collector = m.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.deferred) await interaction.deferUpdate();

        if (interaction.customId === "roast_again") {
          const newRoast = roasts[Math.floor(Math.random() * roasts.length)];

          const newEmbed = new EmbedBuilder()
            .setColor("#ff6600")
            .setDescription(`🔥 **${target}, ${newRoast}**`)
            .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
        }
      });

      collector.on("end", () => {
        m.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error("Error in roast command:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};