/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

module.exports = {
  name: "nowplaying",
  aliases: ["nwp", "np"],
  cooldown: "", // You might want to add a cooldown value here
  category: "music",
  usage: "", // Consider adding usage information for clarity
  description: "See what's being played",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: true,
  queue: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args, emoji) => {
    try {
      // Fetch the preset path from the database or use a default value
      const path = 
        (await client.db.preset.get(`${client.user.id}_${message.guild.id}`)) ||
        `cards/card1.js`;

      // Get the player for the guild
      const player = await client.getPlayer(message.guild.id);

      // Get the current track from the player's queue
      const track = player?.queue?.current;

      // Calculate the progress of the track
      const progress = track?.isStream
        ? 50
        : (player?.position / track?.length) * 100;

      // Get the requester of the track
      const requester = track?.requester;

      // Load the preset and pass the necessary data
      const presetData = await require(`@presets/${path}`)({
        title: track?.title?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 25) || "Something Good",
        author: track?.author?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 20) || "PainMoon Music",
        duration: track?.isStream ? "◉ LIVE" : client.formatTime(track?.length) || "06:09",
        thumbnail: track?.thumbnail || client.user.displayAvatarURL({ format: 'png' }),
        color: client.color || "#FFFFFF",
        progress: progress,
        source: track?.sourceName !== "youtube" ? track.sourceName : "spotify",
        requester: requester,
      }, client, player);

      // Send the embed and files as a reply to the message
      await message.reply({
        embeds: presetData[0],
        files: presetData[1],
      });
    } catch (error) {
      console.error("Error in nowplaying command:", error);
      // Optionally send an error message to the user
    }
  },
};
