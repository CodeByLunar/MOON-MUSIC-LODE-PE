/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

const yt =
  /^(?:(?:(?:https?:)?\/\/)?(?:www\.)?)?(?:youtube\.com\/(?:[^\/\s]+\/\S+\/|(?:c|channel|user)\/\S+|embed\/\S+|watch\?(?=.*v=\S+)(?:\S+&)*v=\S+)|(?:youtu\.be\/\S+)|yt:\S+)$/i;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for a song")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("The song name or keywords")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { channel } = interaction.member.voice;
    const query = interaction.options.getString("query");

    if (yt.test(query)) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.warn} **This provider is against ToS!**`
          ),
        ],
        ephemeral: true,
      });
    }

    let x = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.search} **Searching please wait...**`
        ),
      ],
      fetchReply: true,
    });

    const player = await interaction.client.manager.createPlayer({
      voiceId: channel.id,
      textId: interaction.channel.id,
      guildId: interaction.guild.id,
      shardId: interaction.guild.shardId,
      loadBalancer: true,
      deaf: true,
    });

    const result = {};
    result.youtube = await player
      .search(query, {
        requester: interaction.user,
        engine: "youtube",
      })
      .then(res => res.tracks);

    result.spotify = await player
      .search(query, {
        requester: interaction.user,
        engine: "spotify",
      })
      .then(res => res.tracks);

    result.soundcloud = await player
      .search(query, {
        requester: interaction.user,
        engine: "soundcloud",
      })
      .then(res => res.tracks);

    result.tracks = [
      ...result.youtube.slice(0, 5),
      ...result.spotify.slice(0, 5),
      ...result.soundcloud.slice(0, 5),
    ];

    if (!result.tracks.length) {
      return x.edit({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No results found for query**`
          ),
        ],
      });
    }

    const tracks = result.tracks;

    const options = tracks.map((track, index) => ({
      label: `${index} - ${track.title.substring(0, 30)}`,
      value: `${index}`,
      description: `Author: ${track.author.substring(0, 30)} | Duration: ${
        track.isStream ? "◉ LIVE" : interaction.client.formatTime(track.length)
      }`,
      emoji: interaction.client.emoji[track.sourceName],
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu")
      .setPlaceholder("Search results")
      .setMinValues(1)
      .setMaxValues(5)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    let resObj = {
      embeds: [
        new interaction.client.embed()
          .desc(`${interaction.client.emoji.track} **Select a track below**`)
          .setFooter({
            text: "Powered by Pookie",
          }),
      ],
      components: [row],
    };

    const m = await x.edit(resObj);

    const filter = i => i.user.id === interaction.user.id;
    const collector = m.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("end", async (collected, reason) => {
      if (collected.size === 0) {
        await m.edit({
          embeds: [
            new interaction.client.embed().desc(
              `${interaction.client.emoji.warn} **Timeout! No track selected**`
            ),
          ],
          components: [],
        });
      }
    });

    collector.on("collect", async interaction => {
      if (!interaction.deferred) await interaction.deferUpdate();
      await m.delete().catch(() => {});

      let desc = ``;
      for (const value of interaction.values) {
        const song = tracks[value];
        if (song.length < 10000) {
          desc += `${interaction.client.emoji.no} **Not added as less than 30s [${song.title.substring(0, 15)}](https://discord.gg/lode-pe-moon-music)**\n`;
          continue;
        }
        await player.queue.add(song);
        desc += `${interaction.client.emoji.yes} **Added to queue [${song.title}](https://discord.gg/lode-pe-moon-music)**\n`;
      }

      await interaction.followUp({
        embeds: [new interaction.client.embed().desc(desc)],
      });

      if (!player.playing && !player.paused) player.play();
    });
  },
};