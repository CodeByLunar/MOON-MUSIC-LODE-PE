const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/database.js");

module.exports = {
  name: "pl-profile",
  aliases: ["plprofile", "plpr"],
  category: "Playlist",
  description: "View your playlist statistics and information",
  usage: "",
  botPerms: [],
  userPerms: [],

  async execute(client, message) {
    const color = "#FF0000";
    const userId = message.author.id;
    const userDisplayName = message.author.username;
    const userAvatar = message.author.displayAvatarURL({ dynamic: true });

    try {
      // Get all playlists for user
      const playlists = await new Promise((resolve, reject) => {
        db.all(
          "SELECT playlistName, songs FROM playlists WHERE userId = ?",
          [userId],
          (err, rows) => err ? reject(err) : resolve(rows || [])
        );
      });

      // Calculate statistics
      const totalPlaylists = playlists.length;
      const totalSongs = playlists.reduce((sum, playlist) => {
        try {
          return sum + (JSON.parse(playlist.songs || "[]")).length; // Fixed parenthesis here
        } catch {
          return sum;
        }
      }, 0);

      // Create profile embed
      const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
          name: `${userDisplayName}'s Playlist Profile`,
          iconURL: userAvatar
        })
        .setThumbnail(userAvatar)
        .addFields(
          {
            name: "<a:music_disk:1355899364429529290> Total Playlists",
            value: `\`${totalPlaylists}\``,
            inline: true
          },
          {
            name: "<a:music_disk:1355899364429529290> Total Songs",
            value: `\`${totalSongs}\``,
            inline: true
          }
        )
        .setFooter({
          text: `Use ${client.prefix}pl-info to view specific playlists`
        });

      // Handle empty playlist case
      if (totalPlaylists === 0) {
        embed.setDescription("<a:Cross:1271193910831480927> You don't have any playlists yet!\nUse `pl-create` to make one.");
      }

      return message.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Playlist Profile Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> Failed to load playlist profile")
        ]
      });
    }
  }
};