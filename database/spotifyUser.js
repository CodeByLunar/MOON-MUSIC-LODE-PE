const mongoose = require('mongoose');

const SpotifyUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  spotifyId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  followers: { type: Number, default: 0 },
  profileUrl: { type: String, required: true },
  avatar: { type: String },
  refreshToken: { type: String }, // For future OAuth implementation
  accessToken: { type: String }, // For future OAuth implementation
  tokenExpiresAt: { type: Date }, // For future OAuth implementation
  linkedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpotifyUser', SpotifyUserSchema);