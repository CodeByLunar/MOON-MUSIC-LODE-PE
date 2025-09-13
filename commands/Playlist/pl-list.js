const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const db = require("../../Models/database.js");
const lodash = require("lodash");

module.exports = {
  name: "pl-list",
  aliases: ["pllist", "plist"],
  category: "Playlist",
  description: "View a list of your playlists.",
  botPerms: [],
  userPerms: [],
  usage: "",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },

  async execute(client, message) {
    const color = "#FF0000"; // Default embed color

    try {
      // ✅ Fetch user's playlists from the database
      db.all(
        "SELECT playlistName, songs, createdOn FROM playlists WHERE userId = ?",
        [message.author.id],
        (err, rows) => {
          if (err) {
            console.error("🚨 SQLite Error:", err);
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#FF0000")
                  .setDescription(
                    "<a:Cross:1271193910831480927> An error occurred while fetching your playlists."
                  ),
              ],
            });
          }

          // ✅ No playlists found for the user
          if (!rows || rows.length === 0) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(color)
                  .setDescription(
                    "<a:Cross:1271193910831480927> You do not have any playlists."
                  ),
              ],
            });
          }

          // ✅ Format playlists for display
          const list = rows.map(
            (x, i) =>
              `\`${i + 1}\` - **${x.playlistName}** (${JSON.parse(x.songs || "[]").length} tracks) - <t:${Math.floor(
                x.createdOn / 1000
              )}:D>`
          );

          // ✅ Paginate playlists (10 items per page)
          const pages = lodash.chunk(list, 10).map((chunk) => chunk.join("\n"));
          let page = 0;

          // ✅ Initial Embed Setup
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${message.author.username}'s Playlists`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setColor(color)
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
            .setDescription(pages[page]);

          // ✅ If only one page, send embed without buttons
          if (pages.length <= 1) {
            return message.channel.send({ embeds: [embed] });
          }

          // ✅ Pagination Buttons
          const previousButton = new ButtonBuilder()
            .setCustomId("previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);

          const stopButton = new ButtonBuilder()
            .setCustomId("stop")
            .setEmoji("⏹️")
            .setStyle(ButtonStyle.Secondary);

          const nextButton = new ButtonBuilder()
            .setCustomId("next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder().addComponents(
            previousButton,
            stopButton,
            nextButton
          );

          // ✅ Send Initial Message with Buttons
          message.channel
            .send({
              embeds: [embed],
              components: [row],
            })
            .then((msg) => {
              // ✅ Button Collector
              const collector = msg.createMessageComponentCollector({
                filter: (interaction) =>
                  interaction.user.id === message.author.id,
                time: 5 * 60 * 1000, // 5 minutes
              });

              collector.on("collect", async (interaction) => {
                if (!interaction.isButton()) return;

                // ✅ Handle Button Interactions
                if (interaction.customId === "previous") {
                  page = page - 1 < 0 ? pages.length - 1 : page - 1;
                } else if (interaction.customId === "next") {
                  page = page + 1 >= pages.length ? 0 : page + 1;
                } else if (interaction.customId === "stop") {
                  collector.stop();
                  return;
                }

                embed
                  .setDescription(pages[page])
                  .setFooter({
                    text: `Page ${page + 1} of ${pages.length}`,
                  });

                await interaction.update({ embeds: [embed] });
              });

              // ✅ Disable Buttons after Timeout
              collector.on("end", async () => {
                if (!msg) return;

                await msg.edit({
                  components: [
                    new ActionRowBuilder().addComponents(
                      previousButton.setDisabled(true),
                      stopButton.setDisabled(true),
                      nextButton.setDisabled(true)
                    ),
                  ],
                });
              });
            });
        }
      );
    } catch (error) {
      console.error("Error in pl-list command:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
              "<a:Cross:1271193910831480927> An error occurred while fetching your playlists."
            ),
        ],
      });
    }
  },
};