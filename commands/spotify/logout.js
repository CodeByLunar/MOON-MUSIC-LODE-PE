const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");
const mongoose = require('mongoose');
const SpotifyUser = require('../../database/spotifyUser.js');

module.exports = {
  name: "unlinkspotify",
  aliases: ["unlink", "spotifyunlink", "unconnect", "sp-logout"],
  category: "spotify",
  description: "Unlink your Spotify account from the bot.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  usage: "unlinkspotify [force]",
  cooldown: 5,

  execute: async (client, message, args) => {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Database Error")
            .setDescription("Not connected to database. Please try again later.")
            .setColor("#ff5555")
        ]
      });
    }

    const userId = message.author.id;
    
    try {
      const userData = await SpotifyUser.findOne({ discordId: userId });

      if (!userData) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("No Spotify Account Linked")
              .setDescription("You have not linked any Spotify account yet.")
              .setColor("#ff5555")
          ]
        });
      }

      const force = args[0]?.toLowerCase() === "force";
      if (force) {
        await unlinkAccount(userId);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Spotify Account Unlinked")
              .setDescription("Your Spotify account has been forcefully unlinked.")
              .setColor("#1DB954")
          ]
        });
      }

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_unlink")
          .setLabel("Yes, Unlink")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel_unlink")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
      );

      const confirmMsg = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Unlink Spotify Account")
            .setDescription(`Are you sure you want to unlink your Spotify account (${userData.displayName})?\nThis will remove all stored data associated with it.`)
            .setColor("#ffcc00")
            .setThumbnail(userData.avatar || null)
        ],
        components: [confirmRow]
      });

      const collector = confirmMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
          return interaction.reply({ 
            content: "This confirmation is not for you.", 
            ephemeral: true 
          });
        }

        try {
          if (interaction.customId === "confirm_unlink") {
            await unlinkAccount(userId);
            await interaction.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Spotify Account Unlinked")
                  .setDescription(`Successfully unlinked ${userData.displayName}'s Spotify account.`)
                  .setColor("#1DB954")
              ],
              components: []
            });
          } else if (interaction.customId === "cancel_unlink") {
            await interaction.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Cancelled")
                  .setDescription("Your Spotify account remains linked.")
                  .setColor("#999999")
              ],
              components: []
            });
          }
        } catch (error) {
          console.error("Unlink Error:", error);
          await interaction.reply({
            content: "An error occurred while unlinking. Please try again.",
            ephemeral: true
          });
        }
      });

      collector.on("end", async (collected, reason) => {
        try {
          if (!collected.size && confirmMsg.editable) {
            await confirmMsg.edit({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Timeout")
                  .setDescription("No response received. Spotify account unlink cancelled.")
                  .setColor("#999999")
              ],
              components: []
            });
          }
        } catch (error) {
          console.error("Collector End Error:", error);
        }
      });

    } catch (error) {
      console.error("Unlink Command Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error occurred while checking your Spotify link status.")
            .setColor("#ff5555")
        ]
      });
    }
  }
};

async function unlinkAccount(userId) {
  try {
    await SpotifyUser.deleteOne({ discordId: userId });
  } catch (error) {
    console.error("Database Unlink Error:", error);
    throw error;
  }
}