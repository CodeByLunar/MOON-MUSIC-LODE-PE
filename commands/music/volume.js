/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "volume",
  aliases: ["v", "vol"],
  category: "music",
  usage: "[ 1 - 100 ]",
  description: "Set player volume",
  botPerms: [],
  userPerms: [],
  player: true,
  queue: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  execute: async (client, message, args, emoji) => {
    const player = await client.getPlayer(message.guild.id);

    let volume = args.length ? Number(args[0]) : null;
    if (volume !== null) {
      volume = volume < 0 || volume > 100 ? NaN : volume;
      if (!volume) {
        return await message.reply({
          embeds: [new client.embed().desc(`${emoji.no} **Volume must be between 0 and 100**`)],
        }).catch(() => {});
      }

      await player.setVolume(volume);
      return await message.reply({
        embeds: [new client.embed().desc(`${emoji.yes} **Volume set to: \`${volume}%\`**`)],
      }).catch(() => {});
    }

    // Buttons for volume control
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vol_up").setLabel("🔊 Volume +10%").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("vol_down").setLabel("🔉 Volume -10%").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("vol_reset").setLabel("🔄 Reset (80%)").setStyle(ButtonStyle.Secondary)
    );

    const m = await message.reply({
      embeds: [new client.embed().desc(`${emoji.bell} **Current player volume: \`${player.volume}%\`**`)],
      components: [row],
    }).catch(() => {});

    const filter = (interaction) => {
      if (interaction.user.id !== message.author.id) {
        interaction.reply({ 
          embeds: [new client.embed().desc(`${emoji.no} **Only ${message.author.tag} can use these buttons!**`)], 
          ephemeral: true 
        }).catch(() => {});
        return false;
      }
      return true;
    };

    const collector = m.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "vol_up") {
        player.volume = Math.min(player.volume + 10, 100);
      } else if (interaction.customId === "vol_down") {
        player.volume = Math.max(player.volume - 10, 0);
      } else if (interaction.customId === "vol_reset") {
        player.volume = 80;
      }

      await player.setVolume(player.volume);
      await m.edit({
        embeds: [new client.embed().desc(`${emoji.bell} **Current player volume: \`${player.volume}%\`**`)],
      }).catch(() => {});
    });

    collector.on("end", async () => {
      await m.edit({ components: [] }).catch(() => {});
    });
  },
};
