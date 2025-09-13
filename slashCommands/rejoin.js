/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rejoin")
    .setDescription("Rejoin the bot to your voice channel"),

  async execute(interaction) {
    const { channel } = interaction.member.voice;
    if (!channel) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **You must be in a voice channel!**`
          ),
        ],
        ephemeral: true,
      });
    }

    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (!player) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No active player found!**`
          ),
        ],
        ephemeral: true,
      });
    }

    let msg = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.cool} **Re-creating player and rejoining...**`
        ),
      ],
      fetchReply: true,
    });

    await player.destroy();
    await interaction.client.sleep(1500);
    const newPlayer = await interaction.client.manager.createPlayer({
      voiceId: channel.id,
      textId: interaction.channel.id,
      guildId: interaction.guild.id,
      shardId: interaction.guild.shardId,
      loadBalancer: true,
      deaf: true,
    });

    let emb = new interaction.client.embed().desc(
      `${interaction.client.emoji.on} **Re-joined <#${channel.id}> and bound to <#${newPlayer.textId}>**`
    );

    await interaction.editReply({ embeds: [emb] });
  },
};