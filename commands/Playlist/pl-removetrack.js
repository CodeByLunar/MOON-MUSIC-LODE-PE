const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/database.js");

module.exports = {
  name: "pl-removetrack",
  aliases: ["plremtrack", "plrem"],
  category: "Playlist",
  description: "Remove a track from your playlist by its index",
  usage: "<playlist name> <track number>",
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
            .setTitle("Remove Track from Playlist")
            .setDescription("<a:Cross:1271193910831480927> **Incorrect usage**")
            .addFields(
              { name: "Usage", value: "`plrem <playlist name> <track number>`", inline: true },
              { name: "Example", value: "`plrem MyPlaylist 3`", inline: true }
            )
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
        ]
      });
    }

    const playlistName = args[0];
    const trackIndex = parseInt(args[1]);
    const userId = message.author.id;

    // Validate track number
    if (isNaN(trackIndex) || trackIndex < 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> **Please provide a valid track number (starting from 1)**")
        ]
      });
    }

    try {
      // Get playlist from database
      db.get("SELECT * FROM playlists WHERE userId = ? AND playlistName = ?", 
        [userId, playlistName], async (err, playlist) => {
          
          if (err) {
            console.error("Database Error:", err);
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setDescription("<a:Cross:1271193910831480927> Error accessing playlist.")
              ]
            });
          }

          if (!playlist) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setDescription(`<a:Cross:1271193910831480927> Playlist **${playlistName}** not found!`)
              ]
            });
          }

          const songs = JSON.parse(playlist.songs || "[]");
          
          // Validate track index range
          if (trackIndex < 1 || trackIndex > songs.length) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setDescription(`<a:Cross:1271193910831480927> Invalid track number. Please provide a number between **1** and **${songs.length}**`)
              ]
            });
          }

          // Remove the track
          const removedTrack = songs.splice(trackIndex - 1, 1)[0];
          
          // Update database
          db.run("UPDATE playlists SET songs = ? WHERE userId = ? AND playlistName = ?", 
            [JSON.stringify(songs), userId, playlistName], 
            (updateErr) => {
              
              if (updateErr) {
                console.error("Update Error:", updateErr);
                return message.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(color)
                      .setDescription("<a:Cross:1271193910831480927> Failed to update playlist.")
                  ]
                });
              }

              // Success message
              return message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(color)
                    .setTitle("<a:Check:1271193909334114315> Track Removed")
                    .setDescription(`Removed **${removedTrack.title}** from **${playlistName}**`)
                    .setFooter({
                      text: `Now ${songs.length} tracks in playlist`,
                      iconURL: message.author.displayAvatarURL()
                    })
                ]
              });
            }
          );
        }
      );

    } catch (error) {
      console.error("Command Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> An error occurred while processing your request.")
        ]
      });
    }
  }
};