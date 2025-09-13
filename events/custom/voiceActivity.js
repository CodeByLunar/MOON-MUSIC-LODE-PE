const { Events } = require("discord.js");
const voiceDB = require("../../database/Voicetime.js");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const userId = newState.id;

    if (!voiceDB) return console.error("JoshDB voiceTime database not found.");

    if (!oldState.channel && newState.channel) {
      // User joined a voice channel, store join time
      await voiceDB.set(`${userId}_joined`, Date.now());
    } else if (oldState.channel && !newState.channel) {
      // User left a voice channel, calculate time spent
      let joinedAt = await voiceDB.get(`${userId}_joined`);
      if (!joinedAt) return;

      let sessionTime = Math.floor((Date.now() - joinedAt) / 1000 / 60); // Convert ms to minutes
      let totalTime = (await voiceDB.get(`${userId}`)) || 0;

      await voiceDB.set(`${userId}`, totalTime + sessionTime);
      await voiceDB.delete(`${userId}_joined`);
    }
  },
};
