/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const yt =
  /^(?:(?:(?:https?:)?\/\/)?(?:www\.)?)?(?:youtube\.com\/(?:[^\/\s]+\/\S+\/|(?:c|channel|user)\/\S+|embed\/\S+|watch\?(?=.*v=\S+)(?:\S+&)*v=\S+)|(?:youtu\.be\/\S+)|yt:\S+)$/i;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song using a URL, name, or file attachment")
    .addStringOption(option => 
      option.setName("query")
        .setDescription("The song name, URL, or file")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { channel } = interaction.member.voice;

    const query = interaction.options.getString("query");

    if (!query) {
      await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `<a:notify:1277591983443153021> **No query provided! Try a radio: \`${interaction.client.prefix}radio\`**`
          ),
        ],
      });
      return;
    }

    let x = null;

    if (yt.test(query)) {
      if (!(await interaction.client.db.premium.get(`${interaction.client.user.id}_${interaction.user.id}`))) {
        return await interaction.reply({
          embeds: [
            new interaction.client.embed().desc(
              `<a:yellow_warn:1331400946789519465> **This provider is against ToS!**`
            ),
          ],
        });
      }

      x = await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `<a:yellow_warn:1331400946789519465> **This provider is against ToS! Retrieving metadata from a different source...**`
          ),
        ],
      });
    }

    const loading = {
      embeds: [
        new interaction.client.embed().desc(
          `<a:loadingYellowBee:1331400290192195716> **Searching, please wait...**`
        ),
      ],
    };

    x = x
      ? await x.edit(loading)
      : await interaction.reply(loading);

    const player = await interaction.client.manager.createPlayer({
      voiceId: channel.id,
      textId: interaction.channel.id,
      guildId: interaction.guild.id,
      shardId: interaction.guild.shardId,
      loadBalancer: true,
      deaf: true,
    });

    const result = await player.search(query, {
      requester: interaction.user,
    });

    let noRes = {
      embeds: [
        new interaction.client.embed().desc(`<:yellowx:1331401471178182776> **No results found for the query**`),
      ],
    };

    if (!result.tracks.length) {
      return x
        ? await x.edit(noRes)
        : await interaction.reply(noRes);
    }

    const tracks = result.tracks;
    if (result.type === "PLAYLIST") {
      for (let track of tracks) {
        await player.queue.add(track);
      }
    } else {
      if (tracks[0].length < 10000) {
        return interaction.reply({
          embeds: [
            new interaction.client.embed().desc(
              `<:yellowx:1331401471178182776> **Songs shorter than 30 seconds cannot be played!**`
            ),
          ],
        });
      }
      await player.queue.add(tracks[0]);
    }

    let added =
      result.type === "PLAYLIST"
        ? {
            embeds: [
              new interaction.client.embed().desc(
                `<:YellowTick:1331401568016400420> **Added ${tracks.length} tracks from ${result.playlistName} to the queue.**`
              ),
            ],
          }
        : {
            embeds: [
              new interaction.client.embed().desc(
                `<:YellowTick:1331401568016400420> **Added to queue** [${tracks[0].title}]`
              ),
            ],
          };

    if (!player.playing && !player.paused) player.play();

    x
      ? await x.edit(added)
      : await interaction.reply(added);
  },
};
