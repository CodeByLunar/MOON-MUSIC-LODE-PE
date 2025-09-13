/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const anime = require('anime-actions');

module.exports = {
  name: 'hug',
  aliases: [],
  category: 'fun', // ✅ Category set to "fun"
  description: 'Send a hug GIF to someone!',
  args: false,
  usage: 'hug [@user]',
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args, prefix) => {
    const sender = message.author;
    const targetUser = message.mentions.users.first() || sender;

    // Fetch hug GIF
    const hugGif = await anime.hug();

    // Create Embed
    let embed = new client.embed()
      .setColor('#ff0000')
      .setDescription(`${sender} sends a hug to ${targetUser}!`)
      .setImage(hugGif)
      .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

    // Buttons
    let btn1 = new ButtonBuilder()
      .setCustomId('hug_again')
      .setLabel('Hug Again!')
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
        case 'hug_again':
          const newHugGif = await anime.hug();
          let newEmbed = new client.embed()
            .setColor('#ff0000')
            .setDescription(`${sender} sends another hug to ${targetUser}!`)
            .setImage(newHugGif)
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