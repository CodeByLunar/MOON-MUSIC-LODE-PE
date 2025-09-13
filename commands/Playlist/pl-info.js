const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/database.js");

module.exports = {
  name: "pl-info",
  aliases: ["plinfo", "playlistinfo"],
  category: "Playlist",
  description: "Get detailed information about a specific playlist",
  usage: "<playlist name>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000";
    
    // Check if playlist name is provided
    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("Playlist Information")
            .setDescription("<a:Cross:1271193910831480927> **Please provide a playlist name**")
            .addFields(
              { name: "Usage", value: "`plinfo <playlist name>`", inline: true }
            )
            .setFooter({ 
              text: `Requested by ${message.author.tag}`, 
              iconURL: message.author.displayAvatarURL() 
            })
        ]
      });
    }

    const playlistName = args.join(" ");
    const userId = message.author.id;

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
                  .setDescription("<a:Cross:1271193910831480927> An error occurred while fetching playlist info.")
              ]
            });
          }

          if (!playlist) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setDescription(`<a:Cross:1271193910831480927> Playlist **${playlistName}** not found!`)
                  .addFields(
                    { name: "Usage", value: "`plinfo <playlist name>`", inline: true }
                  )
              ]
            });
          }

          // Parse playlist data
          const songs = JSON.parse(playlist.songs || "[]");
          const totalDuration = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
          
          // Format duration
          const durationString = totalDuration > 0 
            ? new Date(totalDuration).toISOString().substr(11, 8)
            : "Not available";

          // Create embed
          const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Playlist Info: ${playlist.playlistName}`)
            .addFields(
              { name: "Total Tracks", value: `${songs.length}`, inline: true },
              { name: "Total Duration", value: durationString, inline: true },
              { name: "Created On", value: `<t:${Math.floor(playlist.createdAt/1000)}:D>`, inline: true }
            )
            .setFooter({ 
              text: `Requested by ${message.author.tag}`, 
              iconURL: message.author.displayAvatarURL() 
            });

          return message.reply({ embeds: [embed] });
      });

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