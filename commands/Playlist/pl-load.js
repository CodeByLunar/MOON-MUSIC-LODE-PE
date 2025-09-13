const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../Models/database.js");

module.exports = {
  name: "pl-load",
  aliases: ["pload"],
  category: "Playlist",
  description: "Load your saved playlist into the queue",
  botPerms: [],
  userPerms: [],
  inVoiceChannel: true,
  sameVoiceChannel: true,
  usage: "<playlist name>",

  async execute(client, message, args) {
    const color = "#FF0000";

    // Voice channel check
    if (!message.member.voice.channel) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> **You must be in a voice channel!**")
        ]
      });
    }

    const playlistName = args.join(" ").trim();
    if (!playlistName) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> **Please provide a playlist name**")
            .addFields(
              { name: "Usage", value: "`pl-load <name>`" },
              { name: "Example", value: "`pl-load MyFavorites`" }
            )
        ]
      });
    }

    const userId = message.author.id;

    try {
      // Get playlist from database
      const playlist = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM playlists WHERE userId = ? AND playlistName = ?",
          [userId, playlistName],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!playlist) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(`<a:Cross:1271193910831480927> **Playlist \`${playlistName}\` not found!**`)
          ]
        });
      }

      const songs = JSON.parse(playlist.songs || "[]");
      if (songs.length < 1) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(`<a:Cross:1271193910831480927> **Playlist \`${playlistName}\` is empty!**`)
          ]
        });
      }

      // Create preview
      const previewEmbed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("<a:music_disk:1355899364429529290> Playlist Preview")
        .setDescription(
          songs.slice(0, 5)
            .map((s, i) => `${i+1}. **${s.title}**${s.author ? ` - ${s.author}` : ''}`)
            .join('\n') +
          (songs.length > 5 ? `\n...and ${songs.length-5} more` : '')
        )
        .setFooter({ text: `${songs.length} tracks • Confirm to load` });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("load_confirm")
          .setLabel("Load")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("load_cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await message.reply({ 
        embeds: [previewEmbed], 
        components: [buttons] 
      });

      // Button handler
      const collector = msg.createMessageComponentCollector({ 
        filter: i => i.user.id === userId,
        time: 120000
      });

      collector.on("collect", async interaction => {
        if (interaction.customId === "load_confirm") {
          await interaction.deferUpdate();
          
          // Loading message
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription("<a:DaisyLoading:1271374998766096479> **Loading playlist...**")
            ],
            components: []
          });

          // Add to queue
          const added = await addSongsToQueue(client, message, songs);

          // Result
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(added > 0 ? "#00FF00" : color)
                .setDescription(
                  added > 0 
                    ? `<a:Check:1271193909334114315> **Loaded ${added} tracks from \`${playlistName}\`**`
                    : `<a:Cross:1271193910831480927> **Failed to load any tracks**`
                )
            ]
          });

        } else if (interaction.customId === "load_cancel") {
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription("<a:Cross:1271193910831480927> **Cancelled**")
            ],
            components: []
          });
        }
        collector.stop();
      });

      collector.on("end", () => {
        if (!msg.deleted) msg.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error("Playlist Load Error:", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> **Error loading playlist**")
        ]
      });
    }
  }
};

async function addSongsToQueue(client, message, songs) {
  let added = 0;
  const player = client.manager.players.get(message.guild.id) || 
    await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id
    });

  for (const song of songs) {
    try {
      const res = await client.manager.search(song.uri || `${song.title} ${song.author || ''}`, message.author);
      if (res.tracks.length) {
        player.queue.add(res.tracks[0]);
        added++;
      }
    } catch (err) {
      console.error(`Error loading track: ${song.title}`, err);
    }
  }

  if (!player.playing && player.queue.size > 0) {
    await player.play();
  }
  return added;
}
