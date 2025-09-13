/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const anime = require('anime-actions');

module.exports = {
  name: 'bonk',
  aliases: [],
  category: 'fun', // ✅ Category set to "fun"
  description: 'Bonk someone on the head!',
  args: false,
  usage: 'bonk [@user]',
  userPerms: [],
  botPerms: [],
  owner: false,

  execute: async (client, message, args, prefix) => {
    const sender = message.author;
    const targetUser = message.mentions.users.first() || 'the air';

    // Fetch bonk GIF
    const bonkGif = await anime.bonk();

    // Create Embed
    let embed = new client.embed()
      .setColor('#ff3366')
      .setDescription(`${sender} bonks ${targetUser} on the head! 🤦‍♂️`)
      .setImage(bonkGif)
      .setFooter({ text: `Requested by: ${sender.tag}`, iconURL: sender.displayAvatarURL({ dynamic: true }) });

    // Buttons
    let btn1 = new ButtonBuilder()
      .setCustomId('bonk_again')
      .setLabel('Bonk Again!')
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
        case 'bonk_again':
          const newBonkGif = await anime.bonk();
          let newEmbed = new client.embed()
            .setColor('#ff3366')
            .setDescription(`${sender} bonks ${targetUser} even harder! 😵‍💫`)
            .setImage(newBonkGif)
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