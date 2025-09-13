const { EmbedBuilder } = require("discord.js");
const cmdCountDB = require("../../database/cmdCount.js");
const voiceDB = require("../../database/Voicetime.js"); // Import voice activity database

module.exports = {
  name: "profile",
  aliases: ["pr"],
  category: "config",
  description: "View your profile and server configurations.",
  botPerms: [],
  userPerms: [],
  execute: async (client, message, args) => {
    const user = message.author;
    const member = message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id).catch(() => null);

    // Fetch data from databases
    let [pfx, premiumUser, dev, admin, commandStats, songStats, messageCount, voiceMinutes] = await Promise.all([
      client.db.pfx.get(`${client.user.id}_${user.id}`),
      client.db.premium.get(`${client.user.id}_${user.id}`),
      client.owners?.includes(user.id) || false,
      client.admins?.includes(user.id) || false,
      client.db.commandStats?.get(`${user.id}`) || {},
      client.db.songStats?.get(`${user.id}`) || {},
      client.db.messageCount?.get(`${user.id}`) || 0,
      voiceDB.get(`${user.id}`) || 0, // Fetch voice activity from JoshDB
    ]);

    // Ensure commandStats and songStats are objects
    if (typeof commandStats !== "object" || commandStats === null) commandStats = {};
    if (typeof songStats !== "object" || songStats === null) songStats = {};

    // Get total commands used
    let totalCommands = 0;
    try {
      totalCommands = (await cmdCountDB.get(`${user.id}`)) || 0;
    } catch (error) {
      console.error("Error fetching totalCommands:", error);
    }

    // Premium status
    let premium = premiumUser
      ? premiumUser === true
        ? "Lifetime"
        : `Expiring <t:${`${premiumUser}`.slice(0, -3)}:R>`
      : "`No Active Plan`";

    // Get user activity status
    const activities = member?.presence?.activities.map((act) => act.name).join(", ") || "None";

    // Define badges
    let badges = [
      dev ? "<:Pookie_dev:1292520242374770799> Developer" : "",
      admin ? "<:MekoMod:1271105388749787148> Admin" : "",
      premiumUser ? "<a:RED_DIAMOND:1292531280562487389> Premium" : "",
      user.id === message.guild.ownerId ? "<:OwnerBadge:134668888888888888> Server Owner" : "",
      member?.roles?.cache?.size > 10 ? "<:RoleCollector:134669999999999999> Role Collector" : "",
      totalCommands > 1000 ? "<:CommandMaster:134670000000000000> Command Master" : "",
      totalCommands > 5000 ? "<:LegendaryUser:134670111111111111> Legendary User" : "",
      activities !== "None" ? "<:ActiveStatus:134670222222222222> Active User" : "",
    ]
      .filter(Boolean)
      .join("\n") || "`No Badges`";

    // XP & Level system
    let xp = totalCommands * 5;
    let level = Math.floor(xp / 500) + 1;
    let levelProgress = xp % 500;
    let levelBarLength = 18;
    let filledLevelBar = Math.round((levelProgress / 500) * levelBarLength);
    let levelProgressBar =
      "█".repeat(filledLevelBar) + "░".repeat(levelBarLength - filledLevelBar);

    // Fetch top songs played
    let topSongs = Object.entries(songStats || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([song, count], index) => `${index + 1}. \`${song}\` ➜ \`${count} plays\``)
      .join("\n") || "`No data yet`";

    // Fetch top commands used
    let topCommands = Object.entries(commandStats || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cmd, count], index) => `${index + 1}. **${cmd}**: \`${count} uses\``)
      .join("\n") || "`No data yet`";

    // Convert voice activity minutes to hours
    let voiceHours = (voiceMinutes / 60).toFixed(1) || "0.0";

    // Create embed
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${user.username}'s Profile`,
        iconURL: user.displayAvatarURL(),
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("#2f3136")
      .setDescription(
        `**Hey! Pookie here, Welcome to Profile Overview**\n\n` +
        `**<a:anisa_playing:1271374996903559221> User Prefix:** ${pfx ? `\`${pfx}\`` : "`Not set`"}\n` +
        `**<a:Users_kastro:1271105380000464979> Badges:**\n${badges}\n\n` +
        `**<:code:1330117890409631754> Commands Used:** \`${totalCommands.toLocaleString()}\`\n` +
        `**<:author:1338377068865388636> Top Songs Played:**\n${topSongs}\n\n` +
        `**<a:RED_DIAMOND:1292531280562487389> Premium Status:** ${premium}`
      )
      .setImage("https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67de7b3c&is=67dd29bc&hm=539b53d94c5788c69f8012b0d25820bebff8c52e197b6bede82062a7e12c24ff&");

    await message.reply({ embeds: [embed] }).catch(() => {});
  },
};
