/** @format */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'catsay',
  aliases: [],
  category: 'fun', // ✅ Category set to "fun"
  description: 'Make the cat say your message!',
  args: true,
  usage: 'catsay <message>',
  userPerms: [],
  botPerms: ['ATTACH_FILES', 'MANAGE_MESSAGES'],
  owner: false,

  execute: async (client, message, args, prefix) => {
    await message.delete();

    const msg = args.join(' ');
    if (!msg) {
      return message.channel.send('What do you want the cat to say?');
    }

    const imageUrl = `https://cataas.com/cat/cute/says/${encodeURIComponent(msg)}`;

    // Create Embed
    let embed = new client.embed()
      .setColor('#ffcc00')
      .setDescription(`🐱 **The cat says:** *${msg}*`)
      .setImage(imageUrl)
      .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    // Buttons
    let btn1 = new ButtonBuilder()
      .setCustomId('catsay_again')
      .setLabel('Say Something Else!')
      .setStyle(ButtonStyle.Primary);

    let row = new ActionRowBuilder().addComponents(btn1);

    let m = await message.channel.send({ embeds: [embed], components: [row] });

    // Button Collector
    const collector = m.createMessageComponentCollector({
      filter: (c) => c.user.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (c) => {
      if (!c.deferred) await c.deferUpdate();

      switch (c.customId) {
        case 'catsay_again':
          await message.channel.send('What do you want the cat to say next? Reply within 30 seconds.');

          const filter = (response) => response.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });

          if (!collected.size) return message.channel.send('You took too long!');

          const newMsg = collected.first().content;
          const newImageUrl = `https://cataas.com/cat/cute/says/${encodeURIComponent(newMsg)}`;

          let newEmbed = new client.embed()
            .setColor('#ffcc00')
            .setDescription(`🐱 **The cat says:** *${newMsg}*`)
            .setImage(newImageUrl)
            .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

          await m.edit({ embeds: [newEmbed] });
          collected.first().delete();
          break;
      }
    });

    collector.on('end', () => {
      m.edit({ components: [] }).catch(() => {});
    });
  },
};