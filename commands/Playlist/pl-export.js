const db = require("../../Models/database.js");
const { EmbedBuilder } = require("discord.js");
const crypto = require("crypto");

module.exports = {
  name: "pl-export",
  aliases: ["plexport"],
  category: "Playlist",
  description: "Generate a shareable code for your playlist",
  usage: "<playlist name>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000";

    if (!args.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("Export Playlist")
            .setDescription("<a:Cross:1271193910831480927> **Please specify a playlist name**")
            .addFields(
              { name: "Usage", value: "`plexport <playlist name>`", inline: true },
              { name: "Example", value: "`plexport MyPlaylist`", inline: true }
            )
        ]
      });
    }

    const playlistName = args.join(" ");
    const userId = message.author.id;

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

        // Generate 8-digit share code
        const shareCode = crypto.randomBytes(4).toString('hex').slice(0, 8).toUpperCase();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now

        // Store the share code in database
        db.run(
          "INSERT INTO shared_playlists (code, userId, playlistName, playlistData, expiresAt) VALUES (?, ?, ?, ?, ?)",
          [shareCode, userId, playlistName, playlist.songs, expiresAt],
          (insertErr) => {
            if (insertErr) {
              console.error("Insert Error:", insertErr);
              return message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<a:Cross:1271193910831480927> Failed to generate share code")
                ]
              });
            }

            // Success response
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#00FF00")
                  .setTitle("<a:Check:1271193909334114315> Share Code Generated")
                  .setDescription(`Here's your share code for **${playlistName}**`)
                  .addFields(
                    { 
                      name: "Share Code", 
                      value: `\`${shareCode}\``,
                      inline: true 
                    },
                    { 
                      name: "Expires In", 
                      value: "7 days",
                      inline: true 
                    }
                  )
                  .setFooter({
                    text: `This code can be imported by others using the "pl-import" command`,
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