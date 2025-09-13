/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const voucher_codes = require("voucher-code-generator");

module.exports = {
  name: "gen",
  aliases: ["generate"],
  category: "owner",
  usage: "",
  description: "Generate redeem code",
  args: false,
  admin: true,
  owner: true,
  execute: async (client, message) => {
    // Define options for the select menus
    const durations = [
      { label: "1 Day", value: "1" },
      { label: "3 Days", value: "3" },
      { label: "7 Days", value: "7" },
      { label: "30 Days", value: "30" },
      { label: "90 Days", value: "90" },
      { label: "180 Days", value: "180" },
      { label: "365 Days", value: "365" },
      { label: "Lifetime", value: "9999" },
    ];

    // Create select menus for user and guild codes
    const userSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("user_code_duration")
      .setPlaceholder("Select duration for user code")
      .addOptions(durations);

    const guildSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("guild_code_duration")
      .setPlaceholder("Select duration for guild code")
      .addOptions(durations);

    // Create action rows to hold the select menus
    const userRow = new ActionRowBuilder().addComponents(userSelectMenu);
    const guildRow = new ActionRowBuilder().addComponents(guildSelectMenu);

    // Create an embed to guide the user
    const embed = new EmbedBuilder()
      .setTitle("Generate Redeem Code")
      .setDescription("Please select the duration for the code:")
      .addFields(
        { name: "User Code", value: "Choose duration for a user redeem code.", inline: true },
        { name: "Guild Code", value: "Choose duration for a guild redeem code.", inline: true }
      )
      .setColor("#FFD700");

    // Send the embed with the select menus
    const response = await message.reply({ embeds: [embed], components: [userRow, guildRow] });

    // Create a collector to handle interactions
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = response.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      const duration = interaction.values[0];
      const prefix = interaction.customId === "user_code_duration" ? "user-" : "guild-";
      const code = voucher_codes.generate({
        prefix,
        length: 16,
        charset: voucher_codes.charset("alphanumeric"),
      })[0];

      // Store the code in the database with its duration
      await client.db.vouchers.set(code, { duration: parseInt(duration), type: prefix.slice(0, -1) });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Redeem Code Generated")
            .setDescription(`Your generated code is: ||${code}||`)
            .addFields({ name: "Duration", value: `${duration} days`, inline: true })
            .setColor("#00FF00"),
        ],
        ephemeral: true,
      });
    });

    collector.on("end", () => {
      // Disable the select menus after the collector ends
      const disabledUserSelectMenu = userSelectMenu.setDisabled(true);
      const disabledGuildSelectMenu = guildSelectMenu.setDisabled(true);
      const disabledUserRow = new ActionRowBuilder().addComponents(disabledUserSelectMenu);
      const disabledGuildRow = new ActionRowBuilder().addComponents(disabledGuildSelectMenu);

      response.edit({ components: [disabledUserRow, disabledGuildRow] });
    });
  },
};
