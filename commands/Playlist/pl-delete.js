const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../Models/database.js");

module.exports = {
  name: "pl-delete",
  aliases: ["pldelete", "pdel"],
  category: "Playlist",
  description: "Permanently delete one of your playlists",
  usage: "<playlist name>",
  botPerms: [],
  userPerms: [],

  async execute(client, message, args) {
    const color = "#FF0000"; // Consistent red color throughout
    const playlistName = args.join(" ").trim();

    // Input validation
    if (!playlistName) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> **Please specify a playlist name**")
            .addFields(
              { name: "Usage", value: "`pl-delete <playlist name>`" },
              { name: "Example", value: "`pl-delete MyFavorites`" }
            )
        ]
      });
    }

    const userId = message.author.id;

    try {
      // Check playlist existence (case insensitive)
      const playlistExists = await new Promise((resolve) => {
        db.get(
          "SELECT 1 FROM playlists WHERE userId = ? AND playlistName LIKE ?",
          [userId, playlistName],
          (err, row) => resolve(!!row)
        );
      });

      if (!playlistExists) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(`<a:Cross:1271193910831480927> **Playlist \`${playlistName}\` not found**`)
          ]
        });
      }

      // Confirmation dialog
      const confirmEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle("<a:notify:1277591983443153021> Confirm Playlist Deletion")
        .setDescription(`You are about to delete:\n**\`${playlistName}\`**\n\nThis action is **permanent**!`)
        .setFooter({ text: "This request will timeout in 2 minutes" });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm")
          .setLabel("Delete Permanently")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
      );

      const confirmationMsg = await message.reply({ 
        embeds: [confirmEmbed], 
        components: [buttons] 
      });

      // Button interaction handler
      const collector = confirmationMsg.createMessageComponentCollector({ 
        time: 120000 // 2 minutes
      });

      collector.on("collect", async interaction => {
        if (interaction.customId === "confirm") {
          // Perform deletion
          const success = await new Promise(resolve => {
            db.run(
              "DELETE FROM playlists WHERE userId = ? AND playlistName = ?",
              [userId, playlistName],
              function(err) {
                resolve(!err && this.changes > 0);
              }
            );
          });

          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription(
                  success 
                    ? `<a:Check:1271193909334114315> **\`${playlistName}\` was deleted**`
                    : `<a:Cross:1271193910831480927> Failed to delete playlist`
                )
            ],
            components: []
          });
        } else {
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(color)
                .setDescription("<a:Cross:1271193910831480927> Deletion cancelled")
            ],
            components: []
          });
        }
        collector.stop();
      });

      collector.on("end", () => {
        confirmationMsg.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error("Delete Error:", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<a:Cross:1271193910831480927> An error occurred while processing")
        ]
      });
    }
  }
};