const db = require("../../Models/database.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "pl-create",
  aliases: ["plmake", "newpl"],
  category: "Playlist",
  description: "Create a new empty playlist",
  usage: "<playlist name>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000";
    const playlistName = args.join(" ").trim();

    // Validate playlist name
    if (!playlistName) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Please provide a playlist name!")
            .addFields(
              { name: "Usage", value: "`pl-create <name>`", inline: true },
              { name: "Example", value: "`pl-create MyFavorites`", inline: true }
            )
        ]
      });
    }

    // Name validation
    if (playlistName.length > 20) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Playlist name too long (max 20 characters)")
        ]
      });
    }

    const userId = message.author.id;
    const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    try {
      // Check if playlist exists (case insensitive)
      const exists = await new Promise((resolve, reject) => {
        db.get(
          "SELECT 1 FROM playlists WHERE userId = ? AND LOWER(playlistName) = LOWER(?)",
          [userId, playlistName],
          (err, row) => err ? reject(err) : resolve(!!row)
        );
      });

      if (exists) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(`<a:Cross:1271193910831480927> Playlist **${playlistName}** already exists!`)
          ]
        });
      }

      // Create new playlist
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO playlists (userId, playlistName, songs, createdOn) VALUES (?, ?, ?, ?)",
          [userId, playlistName, "[]", createdAt],
          function(err) {
            if (err) return reject(err);
            if (this.changes === 0) reject(new Error("No rows were inserted"));
            resolve();
          }
        );
      });

      // Get total playlists count
      const totalPlaylists = await new Promise((resolve) => {
        db.get(
          "SELECT COUNT(*) as count FROM playlists WHERE userId = ?",
          [userId],
          (err, row) => resolve(err ? "?" : row.count)
        );
      });

      // Success message
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00FF00") // Green for success
            .setTitle("<a:Check:1271193909334114315> Playlist Created")
            .setDescription(`Successfully created playlist **${playlistName}**`)
            .addFields(
              { name: "Total Playlists", value: totalPlaylists.toString(), inline: true }
            )
            .setFooter({
              text: `Created by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
        ]
      });

    } catch (error) {
      console.error("Playlist Creation Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Failed to create playlist. Please try again later.")
        ]
      });
    }
  }
};