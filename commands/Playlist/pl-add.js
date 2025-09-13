const db = require("../../Models/database.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "pl-add",
  aliases: ["pladd", "playlistadd"],
  category: "Playlist",
  description: "Add a song or playlist to your saved playlists",
  usage: "<playlist name> <song name/URL>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000";

    // Basic validation
    if (args.length < 2) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("Add to Playlist")
            .setDescription("<a:Cross:1271193910831480927> **Incomplete command**")
            .addFields(
              { name: "Usage", value: "`pladd <playlist name> <song/URL>`", inline: true },
              { name: "Example", value: "`pladd MyPlaylist Believer`", inline: true }
            )
        ]
      });
    }

    const playlistName = args[0];
    const songQuery = args.slice(1).join(" ");
    const userId = message.author.id;

    // Check if music system is ready
    if (!client.manager) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Music system not initialized!")
        ]
      });
    }

    // Search for tracks
    let searchResult;
    try {
      searchResult = await client.manager.search(songQuery, { requester: message.author });
    } catch (error) {
      console.error("Search Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Failed to search for tracks")
        ]
      });
    }

    if (!searchResult?.tracks?.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`<a:Cross:1271193910831480927> No results for \`${songQuery}\``)
        ]
      });
    }

    // Determine tracks to add
    const isSpotifyPlaylist = songQuery.includes("spotify.com/playlist/");
    const tracksToAdd = isSpotifyPlaylist ? searchResult.tracks : [searchResult.tracks[0]];

    // Database operation
    db.get("SELECT * FROM playlists WHERE userId = ? AND playlistName = ?", 
      [userId, playlistName], (err, playlist) => {
        
        if (err) {
          console.error("Database Error:", err);
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription("<a:Cross:1271193910831480927> Database error occurred")
            ]
          });
        }

        if (!playlist) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription(`<a:Cross:1271193910831480927> Playlist **${playlistName}** not found`)
            ]
          });
        }

        // Prepare updated playlist
        const currentSongs = JSON.parse(playlist.songs || "[]");
        const newSongs = [
          ...currentSongs,
          ...tracksToAdd.map(track => ({
            title: track.title,
            uri: track.uri,
            author: track.author || "Unknown",
            duration: track.length || 0
          }))
        ];

        // Update database
        db.run(
          "UPDATE playlists SET songs = ? WHERE userId = ? AND playlistName = ?",
          [JSON.stringify(newSongs), userId, playlistName],
          (updateErr) => {
            if (updateErr) {
              console.error("Update Error:", updateErr);
              return message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<a:Cross:1271193910831480927> Failed to update playlist")
                ]
              });
            }

            // Success response
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setTitle("<a:Check:1271193909334114315> Success")
                  .setDescription(`Added **${tracksToAdd.length}** track(s) to **${playlistName}**`)
                  .addFields(
                    { 
                      name: "Latest Addition", 
                      value: tracksToAdd[0].title,
                      inline: true 
                    },
                    { 
                      name: "Total Tracks", 
                      value: newSongs.length.toString(),
                      inline: true 
                    }
                  )
                  .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL()
                  })
              ]
            });
          }
        );
      }
    );
  }
};