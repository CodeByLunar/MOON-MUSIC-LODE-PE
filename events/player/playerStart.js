/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { VibeSync } = require('vibesync');

module.exports = {
  name: "playerStart",
  run: async (client, player, track) => {
    
    const vcStatus = new VibeSync(client);
    const channelId = player.voiceId;  
    const status = ` ${player.queue.current.title}`;
    const cnl = client.channels.cache.get(channelId);

    if (!cnl) {
        console.error('Voice channel not found');
        return;
    }
    
    vcStatus.setVoiceStatus(channelId, status)
      .then(() => console.log('kala lund'))
      .catch(err => console.error('kala lund', err));
    
    if (!track?.title) return;

    const premium = await client.db.premium.get(
      `${client.user.id}_${player.guildId}`
    );
    const path =
      (await client.db.preset.get(`${client.user.id}_${player.guildId}`)) ||
      `embeds/embed3.js`;

    let requester = track?.requester;

    const data = await require(`@presets/${path}`)(
      {
        title:
          track?.title.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 25) ||
          "Something Good",
        author:
          track?.author.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 20) ||
          "ryxx_28",
        duration: track?.isStream
          ? "◉ LIVE"
          : client.formatTime(player.queue?.current?.length) || "06:09",
        thumbnail:
          track?.thumbnail ||
          client.user.displayAvatarURL().replace("webp", "png"),
        color: client.color || "#FFFFFF",
        progress: Math.floor(Math.random() * 60) + 10 || 70,
        source: track?.sourceName,
        requester: requester,
      },
      client,
      player
    );

    await player.data.set("autoplaySystem", track);
    
    let channel = await client.channels.cache.get(player.textId);

    const msg = await channel
      ?.send({
        embeds: data[0],
        files: data[1],
        components: data[2],
      })
      .catch(() => {});

    if (msg) player.data.set("message", msg);

    await client.webhooks.player.send({
  username: client.user.username,
  avatarURL: client.user.displayAvatarURL(),
  embeds: [
    new client.embed()
      .setTitle("Now Playing")
      .setThumbnail(track.thumbnail || client.user.displayAvatarURL())
      .setDescription(
        `**Track:** ${track?.title?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 50) || "Unknown"}\n` +
        `**Duration:** ${track?.duration || "Unknown"}\n` +
        `**Requested by:** <@${track?.requester?.id || "unknown"}>\n` +
        `**Source:** ${track?.source || "Unknown"}\n` +
        `**Playing in:** \`${client.guilds.cache.get(player.guildId)?.name || "Unknown Server"}\``
      )
      .setColor(client.config.color || "#ff5555")
      .setFooter({ text: `Guild ID: ${player.guildId}` })
      .setTimestamp(),
  ],
})
      .catch(() => {});
  },
};
