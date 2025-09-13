module.exports = {
  name: "config",
  aliases: ["cnf"],
  category: "config",
  description: "See server configurations.",
  botPerms: [],
  userPerms: [],
  execute: async (client, message, args) => {
    try {
      let [
        prefix,
        premiumGuild,
        twoFourSeven,
        autoplayStatus,
        searchEngine,
        commandUsage,
        botUptime
      ] = await Promise.all([
        client.db.pfx?.get(`${client.user.id}_${message.guild.id}`) || null,
        client.db.premium?.get(`${client.user.id}_${message.guild.id}`) || null,
        client.db.twoFourSeven?.get(`${client.user.id}_${message.guild.id}`) || null,
        client.db.autoplay?.get(`${message.guild.id}`) || false,
        client.db.engine?.get(`${message.guild.id}`) || "YouTube",
        client.db.cmdCount?.get(`${message.author.id}`) || 0,
        Math.floor(process.uptime())
      ]);

      let premiumStatus = premiumGuild
        ? premiumGuild === true
          ? "Lifetime"
          : `Expiring: <t:${`${premiumGuild}`?.slice(0, -3)}:R>`
        : "Not Activated";module.exports = {
  name: "config",
  aliases: ["cnf"],
  category: "config",
  description: "See server configurations.",
  execute: async (client, message, args) => {
    try {
      let db = client.db || {};

      let [
        prefix,
        premiumGuild,
        twoFourSeven,
        autoplayStatus,
        searchEngine,
        commandUsage,
        botUptime
      ] = await Promise.all([
        db.pfx?.get(`${client.user.id}_${message.guild.id}`) || null,
        db.premium?.get(`${client.user.id}_${message.guild.id}`) || null,
        db.twoFourSeven?.get(`${client.user.id}_${message.guild.id}`) || null,
        db.autoplay?.get(`${message.guild.id}`) || false,
        db.engine?.get(`${message.guild.id}`) || "YouTube",
        db.cmdCount?.get(`${message.author.id}`) || 0,
        Math.floor(process.uptime())
      ]);

      let premiumStatus = premiumGuild
        ? typeof premiumGuild === "number"
          ? `Expiring: <t:${Math.floor(premiumGuild / 1000)}:R>`
          : "Lifetime"
        : "Not Activated";

      let twoFourSevenStatus = twoFourSeven
        ? `Enabled\n> Text Channel: <#${twoFourSeven?.TextId || "None"}>\n> Voice Channel: <#${twoFourSeven?.VoiceId || "None"}>`
        : "Disabled";

      let autoplay = autoplayStatus ? "Enabled" : "Disabled";

      let uptimeHours = Math.floor(botUptime / 3600);
      let uptimeMinutes = Math.floor((botUptime % 3600) / 60);
      let uptimeSeconds = botUptime % 60;
      let uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

      let totalMembers = message.guild.memberCount;
      let botCount = message.guild.members.cache.filter(member => member.user.bot).size;
      let humanCount = totalMembers - botCount;
      let onlineUsers = message.guild.members.cache.filter(m => m.presence?.status !== "offline").size;

      let textChannel = twoFourSeven?.TextId ? `<#${twoFourSeven.TextId}>` : "None";
      let voiceChannel = twoFourSeven?.VoiceId ? `<#${twoFourSeven.VoiceId}>` : "None";

      let premiumFeatures = premiumGuild
        ? `> No Advertisements\n` +
          `> Premium Guild Badge\n` +
          `> Custom Play Embed Presets\n` +
          `> Vote-Locked Command Bypass`
        : "Your server has no premium features.";

      await message.reply({
        embeds: [
          new client.embed()
            .setColor("#2F3136")
            .setAuthor({
              name: `Server Configuration Overview - ${message.guild.name}`,
              iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(
              `\n**GENERAL SETTINGS**\n` +
              `> Prefix: \`${client.prefix}\`${prefix ? ` / \`${prefix}\`` : ""}\n` +
              `> Default Music Source: \`${searchEngine}\`\n` +
              `> Autoplay Music: ${autoplay}\n\n` +
              
              `**MUSIC FEATURES**\n` +
              `> 24/7 Mode: ${twoFourSevenStatus}\n` +
              `> 24/7 Text Channel: ${textChannel}\n` +
              `> 24/7 Voice Channel: ${voiceChannel}\n\n` +

              `**BOT STATUS**\n` +
              `> Bot Uptime: ${uptimeFormatted}\n` +
              `> Commands Used (You): \`${commandUsage}\`\n\n` +

              `**PREMIUM FEATURES**\n${premiumFeatures}\n\n` +
              
              `**Premium Status:** ${premiumStatus}`
            )
            .setFooter({
              text: `For more info, use ${client.prefix}preset`,
            }),
        ],
      });
    } catch (error) {
      console.error("Error fetching server config:", error);
      message.reply("Failed to retrieve server configuration. Please try again.");
    }
  },
};


      let twoFourSevenStatus = twoFourSeven
        ? `Enabled\n> Text Channel: <#${twoFourSeven.TextId}>\n> Voice Channel: <#${twoFourSeven.VoiceId}>`
        : "Disabled";

      let autoplay = autoplayStatus ? "Enabled" : "Disabled";

      let uptimeHours = Math.floor(botUptime / 3600);
      let uptimeMinutes = Math.floor((botUptime % 3600) / 60);
      let uptimeSeconds = botUptime % 60;
      let uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

      let totalMembers = message.guild.memberCount;
      let botCount = message.guild.members.cache.filter(member => member.user.bot).size;
      let humanCount = totalMembers - botCount;
      let onlineUsers = message.guild.members.cache.filter(m => m.presence && m.presence.status !== "offline").size;

      let textChannel = twoFourSeven?.TextId ? `<#${twoFourSeven.TextId}>` : "None";
      let voiceChannel = twoFourSeven?.VoiceId ? `<#${twoFourSeven.VoiceId}>` : "None";

      let premiumFeatures = premiumGuild
        ? `> No Advertisements\n` +
          `> Premium Guild Badge\n` +
          `> Custom Play Embed Presets\n` +
          `> Vote-Locked Command Bypass`
        : "Your server has no premium features.";

      await message.reply({
        embeds: [
          new client.embed()
            .setColor("#2F3136")
            .setAuthor({
              name: `Server Configuration Overview - ${message.guild.name}`,
              iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(
              `\nGENERAL SETTINGS\n` +
              `> Prefix: \`${client.prefix}\`${prefix ? ` / \`${prefix}\`` : ""}\n` +
              `> Default Music Source: \`${searchEngine}\`\n` +
              `> Autoplay Music: ${autoplay}\n\n` +
              
              `MUSIC FEATURES\n` +
              `> 24/7 Mode: ${twoFourSevenStatus}\n` +
              `> 24/7 Text Channel: ${textChannel}\n` +
              `> 24/7 Voice Channel: ${voiceChannel}\n\n` +

              `BOT STATUS\n` +
              `> Bot Uptime: ${uptimeFormatted}\n` +
              `> Commands Used (You): \`${commandUsage}\`\n\n` +

              `PREMIUM FEATURES\n${premiumFeatures}\n\n` +
              
              `Premium Status: ${premiumStatus}`
            )
            .setFooter({
              text: `For more info, use ${client.prefix}preset`,
            }),
        ],
      });
    } catch (error) {
      console.error("Error fetching server config:", error);
      message.reply("Failed to retrieve server configuration. Please try again.");
    }
  },
};
