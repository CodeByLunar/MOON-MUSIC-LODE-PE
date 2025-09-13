const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "node",
  aliases: ["node", "ll", "nd"],
  cooldown: "",
  category: "information",
  usage: "",
  description: "Displays Lavalink node status",
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
  execute: async (client, message, args) => {
    const fetchingMessage = await message.reply("<a:DaisyLoading:1271374998766096479> Fetching Node details...");

    const onlineEmoji = '<a:chingari_ping:1271375000821301352>';
    const offlineEmoji = '<a:online:1271375003828486251>';

    const nodeStats = [...client.manager.shoukaku.nodes.values()]
      .map(node => {
        const statusEmoji = node.stats.players > 0 ? onlineEmoji : offlineEmoji;
        const uptime = client.formatTime(node.stats.uptime);

        return {
          name: `Node Status: ${statusEmoji}`,
          value: `\`\`\`asciidoc
Players      :: ${node.stats.players}
Playing      :: ${node.stats.playingPlayers}
Uptime       :: ${uptime}
Memory       :: ${(node.stats.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GiB / ${(node.stats.memory.reservable / (1024 * 1024 * 1024)).toFixed(1)} GiB
Nodes Load   :: ${node.stats.cpu.lavalinkLoad.toFixed(2)}%
System Load  :: ${node.stats.cpu.systemLoad.toFixed(2)}%
\`\`\``
        };
      });

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .addFields(nodeStats)
      .setTimestamp();

    await fetchingMessage.edit({ content: null, embeds: [embed] }).catch(() => {});

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("refresh")
          .setLabel("Refresh")
          .setStyle(ButtonStyle.Primary)
      );

    const m = await fetchingMessage.edit({ embeds: [embed], components: [row] }).catch(() => {});

    const filter = async (interaction) => {
      if (interaction.user.id === message.author.id) return true;

      await interaction.reply({
        content: `Only **${message.author.tag}** can use this`,
        ephemeral: true,
      }).catch(() => {});

      return false;
    };

    const collector = m.createMessageComponentCollector({
      filter: filter,
      time: 60000,
      idle: 30000,
    });

    collector.on("collect", async (c) => {
      if (!c.deferred) await c.deferUpdate();

      if (c.customId === "refresh") {
        const updatedNodeStats = [...client.manager.shoukaku.nodes.values()]
          .map(node => {
            const statusEmoji = node.stats.players > 0 ? onlineEmoji : offlineEmoji;
            const uptime = client.formatTime(node.stats.uptime);

            return {
              name: `Node Status: ${statusEmoji}`,
              value: `\`\`\`asciidoc
Players      :: ${node.stats.players}
Playing      :: ${node.stats.playingPlayers}
Uptime       :: ${uptime}
Memory       :: ${(node.stats.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GiB / ${(node.stats.memory.reservable / (1024 * 1024 * 1024)).toFixed(1)} GiB
Nodes Load   :: ${node.stats.cpu.lavalinkLoad.toFixed(2)}%
System Load  :: ${node.stats.cpu.systemLoad.toFixed(2)}%
\`\`\``
            };
          });

        const updatedEmbed = new EmbedBuilder()
          .setColor(0x1abc9c)
          .addFields(updatedNodeStats)
          .setTimestamp();

        await m.edit({ embeds: [updatedEmbed] }).catch(() => {});
      }
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId("refresh").setLabel("Refresh").setStyle(ButtonStyle.Primary).setDisabled(true)
        );

      await m.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
