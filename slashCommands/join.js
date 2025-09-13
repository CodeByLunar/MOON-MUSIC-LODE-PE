/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a voice channel or move to a different one"),

  async execute(interaction) {
    const { channel } = interaction.member.voice;
    if (!channel) {
      return await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(`${interaction.client.emoji.no} **You must be in a voice channel!**`),
        ],
        ephemeral: true,
      });
    }

    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (player) {
      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("move")
          .setLabel("Move Me")
          .setStyle(ButtonStyle.Success)
      );

      let m = await interaction.reply({
        embeds: [
          new interaction.client.embed()
            .desc(`${interaction.client.emoji.bell} **I'm already in <#${player.voiceId}>**`)
            .setFooter({ text: "Click 'Move Me' to shift voice channels" }),
        ],
        components: [row],
        ephemeral: true,
      });

      const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
      const collector = m.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (btnInteraction) => {
        await btnInteraction.deferUpdate();
        try {
          await interaction.guild.members.me.voice.setChannel(channel);
          player.voiceId = channel.id;
          player.textId = interaction.channel.id;

          let data = await interaction.client.db.twoFourSeven.get(`${interaction.client.user.id}_${interaction.guild.id}`);
          if (data) {
            await interaction.client.db.twoFourSeven.set(`${interaction.client.user.id}_${interaction.guild.id}`, {
              TextId: player.textId,
              VoiceId: player.voiceId,
            });
          }

          await m.edit({
            embeds: [
              new interaction.client.embed().desc(`${interaction.client.emoji.yes} **Moved to <#${channel.id}> and bound to <#${interaction.channel.id}>**`),
            ],
            components: [],
          });
        } catch (error) {
          await m.edit({
            embeds: [
              new interaction.client.embed().desc(`${interaction.client.emoji.no} **Failed to move: ${error.message}**`),
            ],
            components: [],
          });
        }
      });

      return;
    }

    let msg = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(`${interaction.client.emoji.bell} **Joining <#${channel.id}> . . . **`),
      ],
    });

    await interaction.client.manager.createPlayer({
      voiceId: channel.id,
      textId: interaction.channel.id,
      guildId: interaction.guild.id,
      shardId: interaction.guild.shardId,
      loadBalancer: true,
      deaf: true,
    });

    let newPlayer = await interaction.client.getPlayer(interaction.guild.id);
    newPlayer.voiceId = channel.id;
    newPlayer.textId = interaction.channel.id;

    let data = await interaction.client.db.twoFourSeven.get(`${interaction.client.user.id}_${interaction.guild.id}`);
    if (data) {
      await interaction.client.db.twoFourSeven.set(`${interaction.client.user.id}_${interaction.guild.id}`, {
        TextId: newPlayer.textId,
        VoiceId: newPlayer.voiceId,
      });
    }

    await msg.edit({
      embeds: [
        new interaction.client.embed().desc(`${interaction.client.emoji.yes} **Joined <#${channel.id}> and bound to <#${interaction.channel.id}>**`),
      ],
    });
  },
};