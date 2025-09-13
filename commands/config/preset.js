const { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'preset',
  aliases: ['set'],
  category: 'config',
  description: 'Choose your playEmbed',
  botPerms: [],
  userPerms: ['ManageChannels'],

  execute: async (client, message, args, emoji) => {
    const options = [
      { label: "Cards - 1", value: "cards/card1.js" },
      { label: "Cards - 2", value: "cards/card2.js" },
      { label: "Cards - 3", value: "cards/card3.js" },
      { label: "Embeds - 1", value: "embeds/embed1.js" },
      { label: "Embeds - 2", value: "embeds/embed2.js" },
      { label: "Embeds - 3", value: "embeds/embed3.js" }
    ];

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('preset_select')
        .setPlaceholder('Select your playEmbed preset')
        .addOptions(options)
    );

    const confirmButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('preset_confirm').setLabel('Confirm Selection').setStyle(ButtonStyle.Success).setDisabled(true),
      new ButtonBuilder().setCustomId('preset_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger).setDisabled(true)
    );

    let preset = await client.db.preset.get(`${client.user.id}_${message.guild.id}`);
    const path = preset?.replace('js', 'png')?.split('/')[1] || 'card1.png';
    let attachment = new AttachmentBuilder(`${process.cwd()}/assets/previews/${path}`, { name: 'embed.png' });

    const m = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${emoji.cog} **Current play-embed preset:**\n*Choose a new one from the dropdown below and confirm your choice!*`)
          .setImage(`attachment://${attachment.name}`),
      ],
      files: [attachment],
      components: [selectMenu, confirmButtons],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = m.createMessageComponentCollector({ filter, time: 60000 });

    let selectedPreset = null;

    collector.on('collect', async (interaction) => {
      if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

      if (interaction.customId === 'preset_select') {
        selectedPreset = interaction.values[0];
        const imagePath = `${process.cwd()}/assets/previews/${selectedPreset.split('/')[1].replace('js', 'png')}`;
        attachment = new AttachmentBuilder(imagePath, { name: 'preview.png' });

        const updatedButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('preset_confirm').setLabel('Confirm Selection').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('preset_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
        );

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${emoji.cog} Selected Play-Embed`)
              .setImage(`attachment://${attachment.name}`),
          ],
          files: [attachment],
          components: [selectMenu, updatedButtons],
        });
      }

      if (interaction.customId === 'preset_confirm') {
        if (!selectedPreset) return;

        await client.db.preset.set(`${client.user.id}_${message.guild.id}`, selectedPreset);
        attachment = new AttachmentBuilder(`${process.cwd()}/assets/previews/${selectedPreset.split('/')[1].replace('js', 'png')}`, { name: 'preview.png' });

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${emoji.yes} Preset Saved!`)
              .setImage(`attachment://${attachment.name}`),
          ],
          files: [attachment],
          components: [],
        });

        collector.stop();
      }

      if (interaction.customId === 'preset_cancel') {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${emoji.info} **Selection Cancelled.**`),
          ],
          components: [],
        });

        collector.stop();
      }
    });

    collector.on('end', async () => {
      await m.edit({ components: [] }).catch(() => {});
    });
  },
};
