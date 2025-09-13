const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const mongoose = require('mongoose');
const SpotifyUser = require('../../database/spotifyUser.js'); // Import your Mongoose model

module.exports = {
  name: "spotifyprofile",
  aliases: ["sprofile", "spotiprofile"],
  category: "spotify",
  cooldown: 5,
  description: "Displays your linked Spotify profile with a clean advanced UI.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],

  execute: async (client, message) => {
    const userId = message.author.id;
    
    try {
      // Check database connection
      if (!mongoose.connection.readyState) {
        throw new Error('Database not connected');
      }

      // Find user in MongoDB using the same schema as login command
      const userData = await SpotifyUser.findOne({ discordId: userId });
      
      if (!userData) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Spotify Account Not Linked")
              .setDescription(`Use \`${client.prefix}login <profile_url>\` to link your Spotify account.`)
              .setColor("Red"),
          ],
        });
      }

      // Format the profile information
      const description = `
**Username:** ${userData.displayName || "Unknown"}
**Spotify ID:** \`${userData.spotifyId}\`
**Profile URL:** [Click Here](${userData.profileUrl || "https://spotify.com"})
**Followers:** ${userData.followers || "Unknown"}
**Account Linked:** <t:${Math.floor(userData.linkedAt.getTime() / 1000)}:R>

**Auth Status:** ${userData.refreshToken ? "Active Session" : "Token Missing"}
${userData.accessToken ? "**Token Expires:** <t:" + Math.floor(userData.tokenExpiresAt.getTime() / 1000) + ":R>" : ""}
**Last Updated:** <t:${Math.floor(userData.lastUpdated.getTime() / 1000)}:R>
      `.trim();

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle(`${userData.displayName || "Your"} Spotify Profile`)
        .setDescription(description)
        .setThumbnail(userData.avatar || message.author.displayAvatarURL({ dynamic: true }))
        .setColor("#1DB954")
        .setFooter({ 
          text: `User ID: ${userId}`,
          iconURL: message.author.displayAvatarURL()
        });

      // Create action buttons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Open Profile")
          .setStyle(ButtonStyle.Link)
          .setURL(userData.profileUrl || "https://spotify.com"),

        new ButtonBuilder()
          .setCustomId("refresh_profile")
          .setLabel("Refresh")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("unlink_account")
          .setLabel("Unlink")
          .setStyle(ButtonStyle.Danger)
      );

      // Send the message
      const msg = await message.reply({ 
        embeds: [embed], 
        components: [buttons] 
      });

      // Set up button interaction collector
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000, // 2 minutes
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
          return interaction.reply({ 
            content: "This panel is not for you.", 
            ephemeral: true 
          });
        }

        if (interaction.customId === "refresh_profile") {
          await interaction.deferUpdate();
          const updatedEmbed = new EmbedBuilder(embed)
            .setDescription(description.replace(
              /Last Updated:.*/,
              `Last Updated: <t:${Math.floor(Date.now() / 1000)}:R>`
            ));
          await msg.edit({ embeds: [updatedEmbed] });
        }

        if (interaction.customId === "unlink_account") {
          // Confirmation buttons
          const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("confirm_unlink")
              .setLabel("Confirm")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("cancel_unlink")
              .setLabel("Cancel")
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.reply({
            content: "Are you sure you want to unlink your Spotify account?",
            components: [confirmRow],
            ephemeral: true,
          });

          try {
            const confirmation = await interaction.channel.awaitMessageComponent({
              filter: (i) => i.user.id === userId,
              componentType: ComponentType.Button,
              time: 15000,
            });

            if (confirmation.customId === "confirm_unlink") {
              await SpotifyUser.deleteOne({ discordId: userId });
              await confirmation.update({ 
                content: "✅ Spotify account unlinked successfully.", 
                components: [] 
              });
              await msg.edit({ components: [] });
              collector.stop();
            } else {
              await confirmation.update({ 
                content: "Unlink operation cancelled.", 
                components: [] 
              });
            }
          } catch (error) {
            await interaction.editReply({ 
              content: "Confirmation timed out.", 
              components: [] 
            });
          }
        }
      });

      collector.on("end", () => {
        msg.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error("Spotify Profile Command Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error occurred while fetching your profile data. Please try again later.")
            .setColor("Red"),
        ],
      });
    }
  },
};