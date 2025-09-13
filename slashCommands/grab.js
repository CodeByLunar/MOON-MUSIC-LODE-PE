/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grab")
    .setDescription("Get the current song info in DM"),

  async execute(interaction) {
    const player = await interaction.client.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **No song is currently playing!**`
          ),
        ],
        ephemeral: true,
      });
    }

    const track = player.queue.current;
    let embed = new interaction.client.embed()
      .desc(
        `**[${
          track.title.length > 30
            ? track.title.substring(0, 23).replace("[", "").replace("]", "")
            : `${track.title} ${" ".repeat(Math.floor(25 - track.title.length))}`
        }](https://discord.gg/lode-pe-moon-music)**\n` +
          `${interaction.client.emoji.cool} **Duration : \`${
            track.isStream ? "◉ LIVE" : interaction.client.formatTime(track.length)
          }\`**\n` +
          `${interaction.client.emoji.user} **Author : \`${track.author.substring(0, 10)}\`**\n\n`
      )
      .setThumbnail(
        track.thumbnail || interaction.client.user.displayAvatarURL({ format: "PNG" })
      );

    try {
      await interaction.user.send({
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Link to Song")
              .setURL(track.uri)
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setLabel("Add Me")
              .setURL(interaction.client.invite.required)
              .setStyle(ButtonStyle.Link)
          ),
        ],
      });

      await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.yes} **Sent song info to your DM**`
          ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **Couldn't DM you!**`
          ),
        ],
        ephemeral: true,
      });
    }
  },
};