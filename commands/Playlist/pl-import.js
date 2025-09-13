const db = require("../../Models/database.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "pl-import",
  aliases: ["plimport"],
  category: "Playlist",
  description: "Import a playlist using a share code",
  usage: "<share code> <new playlist name>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000";

    if (args.length < 2) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("Import Playlist")
            .setDescription("<a:Cross:1271193910831480927> **Incomplete command**")
            .addFields(
              { name: "Usage", value: "`plimport <share code> <new playlist name>`", inline: true },
              { name: "Example", value: "`plimport ABC12345 MyImportedPlaylist`", inline: true }
            )
        ]
      });
    }

    const shareCode = args[0].toUpperCase();
    const newPlaylistName = args.slice(1).join(" ");
    const userId = message.author.id;

    // Check if playlist name already exists for this user
    db.get("SELECT * FROM playlists WHERE userId = ? AND playlistName = ?", 
      [userId, newPlaylistName], (err, existingPlaylist) => {
        
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

        if (existingPlaylist) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription(`<a:Cross:1271193910831480927> You already have a playlist named **${newPlaylistName}**`)
            ]
          });
        }

        // Get shared playlist data
        db.get("SELECT * FROM shared_playlists WHERE code = ? AND expiresAt > ?", 
          [shareCode, Date.now()], (shareErr, sharedPlaylist) => {
            
            if (shareErr) {
              console.error("Database Error:", shareErr);
              return message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<a:Cross:1271193910831480927> Database error occurred")
                ]
              });
            }

            if (!sharedPlaylist) {
              return message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<a:Cross:1271193910831480927> Invalid or expired share code")
                ]
              });
            }

            // Create new playlist for the user
            db.run(
              "INSERT INTO playlists (userId, playlistName, songs) VALUES (?, ?, ?)",
              [userId, newPlaylistName, sharedPlaylist.playlistData],
              (insertErr) => {
                if (insertErr) {
                  console.error("Insert Error:", insertErr);
                  return message.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(color)
                        .setDescription("<a:Cross:1271193910831480927> Failed to import playlist")
                    ]
                  });
                }

                // Success response
                return message.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor("#00FF00")
                      .setTitle("<a:Check:1271193909334114315> Playlist Imported")
                      .setDescription(`Successfully imported playlist as **${newPlaylistName}**`)
                      .addFields(
                        { 
                          name: "Original Name", 
                          value: sharedPlaylist.playlistName,
                          inline: true 
                        },
                        { 
                          name: "Tracks", 
                          value: JSON.parse(sharedPlaylist.playlistData).length.toString(),
                          inline: true 
                        }
                      )
                      .setFooter({
                        text: `Imported by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL()
                      })
                  ]
                });
              }
            );
          }
        );
      }
    );
  }
};