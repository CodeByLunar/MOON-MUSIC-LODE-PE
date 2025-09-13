/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("similar")
    .setDescription("Get similar songs to the currently playing one"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No song is currently playing!**`
          ),
        ],
        ephemeral: true,
      });
    }

    let msg = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `${interaction.client.emoji.search} **Searching, please wait...**`
        ),
      ],
      fetchReply: true,
    });

    let current = player.queue.current;
    let query = current.author;
    const result = {};

    result.youtube = await player
      .search(query, { requester: interaction.user, engine: "youtube" })
      .then((res) => res.tracks);

    result.spotify = await player
      .search(query, { requester: interaction.user, engine: "spotify" })
      .then((res) => res.tracks);

    result.soundcloud = await player
      .search(query, { requester: interaction.user, engine: "soundcloud" })
      .then((res) => res.tracks);

    let id = current.identifier;
    query = `https://www.youtube.com/watch?v=${id}&list=RD${id}`;
    result.youtube2 = await player
      .search(query, { requester: interaction.user, engine: "youtube" })
      .then((res) => res.tracks);

    result.yt = result.youtube2.length > 0 ? result.youtube2 : result.youtube;
    result.tracks = [
      ...result.yt.slice(0, 5).sort(() => Math.random() - 0.5),
      ...result.spotify.slice(0, 5).sort(() => Math.random() - 0.5),
      ...result.soundcloud.slice(0, 5).sort(() => Math.random() - 0.5),
    ];

    if (!result.tracks.length) {
      return msg.edit({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No similar songs found**`
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
          .desc(`${interaction.client.emoji.yes} **Select a track below**`)
          .setFooter({ text: `Powered by Pookie` }),
      ],
      components: [row],
    };

    msg = await msg.edit(resObj);

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
      idle: 30000,
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await msg.edit({
          embeds: [
            new interaction.client.embed()
              .desc(`${interaction.client.emoji.no} **Timeout! No track selected**`)
              .setFooter({ text: `Powered by Pookie` }),
          ],
          components: [],
        });
      }
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      await msg.delete().catch(() => {});

      let desc = ``;
      for (const value of i.values) {
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