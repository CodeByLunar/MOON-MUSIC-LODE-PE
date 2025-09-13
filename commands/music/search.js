const { ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const Canvas = require("canvas");

const yt =
  /^(?:(?:(?:https?:)?\/\/)?(?:www\.)?)?(?:youtube\.com\/(?:[^\/\s]+\/\S+\/|(?:c|channel|user)\/\S+|embed\/\S+|watch\?(?=.*v=\S+)(?:\S+&)*v=\S+)|(?:youtu\.be\/\S+)|yt:\S+)$/i;

module.exports = {
  name: "search",
  aliases: ["sr"],
  category: "music",
  description: "Search for a song and select from the results",
  botPerms: [],
  userPerms: [],
  args: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args, emoji) => {
    const { channel } = message.member.voice;
    const query = args.join(" ");

    if (yt.test(query)) {
      return message.reply({
        embeds: [
          new client.embed().desc(`${emoji.warn} **This provider is against ToS!**`),
        ],
      });
    }

    const x = await message.reply({
      embeds: [new client.embed().desc(`${emoji.search} **Searching, please wait...**`)],
    });

    const player = await client.manager.createPlayer({
      voiceId: channel.id,
      textId: message.channel.id,
      guildId: message.guild.id,
      loadBalancer: true,
      deaf: true,
    });

    const searchResults = {
      youtube: await player.search(query, { requester: message.author, engine: "youtube" }).then((res) => res.tracks),
      spotify: await player.search(query, { requester: message.author, engine: "spotify" }).then((res) => res.tracks),
      soundcloud: await player.search(query, { requester: message.author, engine: "soundcloud" }).then((res) => res.tracks),
    };

    const tracks = [...searchResults.youtube.slice(0, 5), ...searchResults.spotify.slice(0, 5), ...searchResults.soundcloud.slice(0, 5)];

    if (!tracks.length) {
      return x.edit({
        embeds: [new client.embed().desc(`${emoji.no} **No results found!**`)],
      });
    }

    // **Canvas Design**
    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#23272A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Search Results:", 20, 40);

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const y = 80 + i * 80;

      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";
      ctx.fillText(`${i + 1}. ${track.title.length > 30 ? track.title.substring(0, 27) + "..." : track.title}`, 100, y);

      ctx.font = "16px Arial";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText(`By: ${track.author}`, 100, y + 20);
      ctx.fillText(`Duration: ${track.isStream ? "LIVE" : client.formatTime(track.length)}`, 100, y + 40);

      // Load and Draw Thumbnail
      const thumbnail = await Canvas.loadImage(track.thumbnail || client.user.displayAvatarURL({ format: "PNG" }));
      ctx.drawImage(thumbnail, 20, y - 20, 60, 60);
    }

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "search_results.png" });

    // Dropdown Menu
    const options = tracks.map((track, index) => ({
      label: `${index + 1}. ${track.title.length > 30 ? track.title.substring(0, 27) + "..." : track.title}`,
      value: `${index}`,
      description: `By: ${track.author.substring(0, 20)} | Duration: ${track.isStream ? "LIVE" : client.formatTime(track.length)}`,
      emoji: emoji[track.sourceName],
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu")
      .setPlaceholder("Select a song")
      .setMinValues(1)
      .setMaxValues(5)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setDescription(`${emoji.track} **Select a song from below:**`)
      .setFooter({ text: "Powered by Pookie" })
      .setImage("attachment://search_results.png");

    const m = await x.edit({
      embeds: [embed],
      components: [row],
      files: [attachment],
    });

    // Collector
    const filter = async (interaction) => {
      if (interaction.user.id === message.author.id) return true;
      await interaction.reply({
        embeds: [new client.embed().desc(`${emoji.no} Only **${message.author.tag}** can use this!`)],
        ephemeral: true,
      });
      return false;
    };

    const collector = m.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await m.edit({
          embeds: [new client.embed().desc(`${emoji.warn} **Timeout! No track selected.**`).setFooter({ text: "Powered by Pookie" })],
          components: [],
        });
      }
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      await m.delete().catch(() => {});

      let desc = "";
      for (const value of interaction.values) {
        const song = tracks[value];
        if (song.length < 10000) {
          desc += `${emoji.no} **Not added (less than 30s) [${song.title.substring(0, 15)}](https://discord.gg/sVVHQmYFCt)**\n`;
          continue;
        }
        await player.queue.add(song);
        desc += `${emoji.yes} **Added to queue [${song.title}](https://discord.gg/sVVHQmYFCt)**\n`;
      }
      
      await message.reply({ embeds: [new client.embed().desc(desc)] }).catch(() => {});
      if (!player.playing && !player.paused) player.play();
    });
  },
};
