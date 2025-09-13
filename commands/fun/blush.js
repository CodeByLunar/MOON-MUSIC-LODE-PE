/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const anime = require('anime-actions');

module.exports = {
  name: 'blush',
  aliases: [],
  category: 'fun', // ✅ Category set to "fun"
  description: 'Blush in embarrassment!',
  args: false,
  usage: 'blush',
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args, prefix) => {
    const sender = message.author;

    // Fetch blush GIF
    const blushGif = await anime.blush();

    // Create Embed
    let embed = new client.embed()
      .setColor('#ff66b2')
      .setDescription(`${sender} is blushing... 💖`)
      .setImage(blushGif)
      .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

    // Buttons
    let btn1 = new ButtonBuilder()
      .setCustomId('blush_again')
      .setLabel('Blush Again!')
      .setStyle(ButtonStyle.Primary);

    let row = new ActionRowBuilder().addComponents(btn1);

    let m = await message.channel.send({ embeds: [embed], components: [row] });

    // Button Collector
    const collector = m.createMessageComponentCollector({
      filter: (c) => c.user.id === sender.id,
      time: 60000,
    });

    collector.on('collect', async (c) => {
      if (!c.deferred) await c.deferUpdate();

      switch (c.customId) {
        case 'blush_again':
          const newBlushGif = await anime.blush();
          let newEmbed = new client.embed()
            .setColor('#ff66b2')
            .setDescription(`${sender} is blushing even more! 💞`)
            .setImage(newBlushGif)
            .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
          break;
      }
    });

    collector.on('end', () => {
      m.edit({ components: [] }).catch(() => {});
    });
  },
};