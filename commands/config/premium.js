/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require("discord.js");
const voucher_codes = require("voucher-code-generator");

module.exports = {
  name: "premium",
  aliases: [],
  cooldown: "",
  category: "config",
  usage: "",
  description: "Shows your premium status",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args, emoji) => {
    let [premiumUser, premiumGuild, owner, admin] = await Promise.all([
      await client.db.premium.get(`${client.user.id}_${message.author.id}`),
      await client.db.premium.get(`${client.user.id}_${message.guild.id}`),
      await client.owners.find((x) => x === message.author.id),
      await client.admins.find((x) => x === message.author.id),
    ]);

    const cmd = args[0] ? args[0].toLowerCase() : null;
    const type = args[1] ? args[1].toLowerCase() : null;

    switch (cmd) {
      case "gen":
        if (!owner && !admin)
          return await message.reply({
            embeds: [
              new client.embed().desc(
                `${emoji.admin} **Only my Owner/s and Admin/s can use this command**`,
              ),
            ],
          });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("premium_select")
          .setPlaceholder("Select premium duration")
          .addOptions([
            { label: "7 Days", value: "7" },
            { label: "1 Month", value: "30" },
            { label: "3 Months", value: "90" },
            { label: "1 Year", value: "365" },
            { label: "Lifetime", value: "9999" },
          ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Premium Code Generator")
              .setDescription("Select the premium duration from the dropdown below.")
              .setColor("#FFD700"),
          ],
          components: [row],
        });

        const collector = message.channel.createMessageComponentCollector({
          filter: (i) => i.user.id === message.author.id,
          time: 30000,
        });

        collector.on("collect", async (interaction) => {
          let duration = interaction.values[0];
          let code = voucher_codes.generate({
            pattern: `Pookie-#####-USER-DUR${duration}`,
          })[0].toUpperCase();

          await client.db.vouchers.set(code, { valid: true, duration });

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Premium Code Generated!")
                .setDescription(
                  `<a:x_arrow:1280838090319069216> **Here’s your generated code**\n` +
                    `${emoji.bell} **Usage:** \`${client.prefix}redeem your_code\`\n` +
                    `${emoji.rich} ||${code}||\n\n` +
                    `**Duration:** ${duration === "9999" ? "Lifetime" : `${duration} days`}`
                )
                .setColor("#00FF00"),
            ],
            ephemeral: true,
          });

          collector.stop();
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            message.reply({ content: "Time expired! Please try again.", ephemeral: true }).catch(() => {});
          }
        });

        break;

      default:
        await message
          .reply({
            embeds: [
              new client.embed()
                .setAuthor({
                  name: `What about my premium ?`,
                  iconURL: client.user.displayAvatarURL(),
                })
                .desc(
                  `
                    <:Pookie_music:1292516927658524673> Unlock the Ultimate Music Experience with Premium!

Thank you for your interest in upgrading to Premium! <a:RED_DIAMOND:1292531280562487389> With our Premium plan, you can elevate your music sessions to the next level. Here what you can get:

<:autoplay:1331409361066524673> Unlimited Skips - Skip as many tracks as you like, whenever you like!

<:red_volume:1292534876641169502> High-Quality Audio - Enjoy music in stunning clarity, making every beat feel alive.

<a:reddot_:1277566293574291530> 24/7 Playback - Keep the tunes going non-stop, even when you’re offline.

<:Pookie_dev:1292520242374770799> Advanced Commands - Access exclusive features to customize your listening experience.

<:announce:1275024800548655215> Early Access - Be the first to try out new features and updates.

<a:server:1292514644434620459> No Ads - There Will Be No Server Ads When Played Music.

<:Pookie_music:1292516927658524673> No Prefix - You Can Use Bot Without Any Prefix.
`,
                ),
            ],
          })
          .catch(() => {});
        break;
    }
  },
};