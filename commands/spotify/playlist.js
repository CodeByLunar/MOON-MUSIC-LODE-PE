const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  PermissionsBitField
} = require("discord.js");
const axios = require("axios");
const mongoose = require('mongoose');
const SpotifyUser = require('../../database/spotifyUser.js');

module.exports = {
  name: "spotifyplaylists",
  aliases: ["splists", "splaylists"],
  category: "spotify",
  description: "View and play your public Spotify playlists with a clean advanced interface.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  cooldown: 10,

  execute: async (client, message) => {
    if (mongoose.connection.readyState !== 1) {
      return message.reply({
        embeds: [new EmbedBuilder().setTitle("Database Error").setDescription("Not connected to database. Please try again later.").setColor("#ff5555")]
      });
    }

    let userData;
    try {
      userData = await SpotifyUser.findOne({ discordId: message.author.id });
      if (!userData || !userData.spotifyId) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Spotify Not Linked")
              .setDescription(`Please link your Spotify using: \`${client.prefix}login <profile url>\`.`)
              .setColor("#ff5555")
          ]
        });
      }
    } catch (dbError) {
      console.error("Database Error:", dbError);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("Failed to fetch your Spotify data. Please try again later.")
            .setColor("#ff5555")
        ]
      });
    }

    const getSpotifyToken = async () => {
      try {
        const clientId = process.env.SPOTIFY_CLIENT_ID || "6c31645ffb004ab8b44d06f7b96d1b66";
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "3618fdc0b4824cfd91a8d425dac32987";
        const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const res = await axios.post(
          "https://accounts.spotify.com/api/token",
          new URLSearchParams({ grant_type: "client_credentials" }),
          {
            headers: {
              Authorization: `Basic ${creds}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "DiscordBot/1.0"
            },
            timeout: 5000
          }
        );
        return res.data.access_token;
      } catch (error) {
        console.error("Token Error:", error.response?.data || error.message);
        throw new Error("Failed to get Spotify token");
      }
    };

    let playlists = [];
    try {
      const token = await getSpotifyToken();
      const res = await axios.get(
        `https://api.spotify.com/v1/users/${userData.spotifyId}/playlists?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "DiscordBot/1.0"
          },
          timeout: 5000
        }
      );
      playlists = res.data.items.filter(p => p.public || p.collaborative);
      if (!playlists.length) throw new Error("no_playlists");
    } catch (error) {
      console.error("Playlist Fetch Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(error.message === "no_playlists" ? "No Playlists Found" : "Spotify API Error")
            .setDescription(
              error.message === "no_playlists"
                ? "You don't have any public or collaborative playlists available."
                : "Failed to fetch playlists from Spotify. Please try again later."
            )
            .setColor("#ff5555")
        ]
      });
    }

    let index = 0;

    const generateEmbed = (i) => {
      const p = playlists[i];
      return new EmbedBuilder()
        .setAuthor({ name: `${userData.displayName}'s Spotify Playlists`, iconURL: userData.avatar || message.author.displayAvatarURL() })
        .setTitle(p.name.length > 256 ? p.name.substring(0, 253) + "..." : p.name)
        .setURL(p.external_urls.spotify)
        .setThumbnail(p.images?.[0]?.url || null)
        .setDescription([
          `• Owner: ${p.owner.display_name || "Unknown"}`,
          `• Tracks: ${p.tracks.total}`,
          p.description ? `\n${p.description.substring(0, 2000)}` : ""
        ].join("\n"))
        .setFooter({ text: `Playlist ${i + 1} of ${playlists.length}` })
        .setColor("#1DB954");
    };

    const generateComponents = (i) => {
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("Previous").setStyle(ButtonStyle.Secondary).setDisabled(i === 0),
        new ButtonBuilder().setCustomId("play").setLabel("Play").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Secondary).setDisabled(i === playlists.length - 1),
        new ButtonBuilder().setLabel("Open in Spotify").setStyle(ButtonStyle.Link).setURL(playlists[i].external_urls.spotify)
      );

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("playlist_jump")
          .setPlaceholder("Jump to a playlist")
          .addOptions(
            playlists.slice(0, 25).map((p, idx) => ({
              label: p.name.length > 100 ? p.name.substring(0, 97) + "..." : p.name,
              value: idx.toString(),
              description: `${p.tracks.total} tracks • ${p.owner.display_name || "Unknown"}`.substring(0, 100)
            }))
          )
      );

      return [buttonRow, menu];
    };

    const msg = await message.channel.send({
      embeds: [generateEmbed(index)],
      components: generateComponents(index)
    });

    const buttonCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000
    });

    const menuCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60_000
    });

    buttonCollector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "You can't use this interaction.", ephemeral: true });

      if (interaction.customId === "prev") {
        index = Math.max(index - 1, 0);
        return interaction.update({
          embeds: [generateEmbed(index)],
          components: generateComponents(index)
        });
      } else if (interaction.customId === "next") {
        index = Math.min(index + 1, playlists.length - 1);
        return interaction.update({
          embeds: [generateEmbed(index)],
          components: generateComponents(index)
        });
      } else if (interaction.customId === "play") {
        if (!message.member.voice.channel)
          return interaction.reply({ content: "You need to be in a voice channel to play music!", ephemeral: true });

        const playlist = playlists[index];

        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("confirm_play").setLabel("Yes, Play This").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("cancel_play").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

        const confirmationMessage = await interaction.reply({
          content: `Are you sure you want to play "${playlist.name}"?`,
          components: [confirmRow],
          ephemeral: true
        });

        const confirmInt = await interaction.channel.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 15000,
          filter: (btn) => btn.user.id === message.author.id
        }).catch(() => null);

        if (!confirmInt) return confirmationMessage.edit({ content: "Playback request timed out.", components: [] });

        if (confirmInt.customId === "confirm_play") {
          try {
            const player = await client.manager.createPlayer({
              voiceId: message.member.voice.channel.id,
              textId: message.channel.id,
              guildId: message.guild.id,
              shardId: message.guild.shardId,
              loadBalancer: true,
              deaf: true,
            });

            const result = await player.search(playlist.external_urls.spotify, {
              requester: message.author,
            });

            if (!result.tracks.length) {
              return confirmInt.update({
                content: "<:Cross:1330806477253902356> | No results found!",
                components: []
              });
            }

            if (result.type === "PLAYLIST") {
              for (let track of result.tracks) player.queue.add(track);
            } else {
              if (result.tracks[0].length < 10000)
                return confirmInt.update({
                  content: "<:Cross:1330806477253902356> Songs of duration less than `30s` cannot be played!",
                  components: []
                });
              player.queue.add(result.tracks[0]);
            }

            if (!player.playing && !player.paused) player.play();

            return confirmInt.update({
              content: result.type === "PLAYLIST"
                ? `<:n_tick:1330740260967026690> Added ${result.tracks.length} from ${result.playlistName} to queue.`
                : `<:n_tick:1330740260967026690> Added to queue ${result.tracks[0].title.replace("[", "").replace("]", "")}`,
              components: []
            });

          } catch (err) {
            console.error("Play Error:", err);
            return confirmInt.update({
              content: "Failed to play the playlist. Please try again.",
              components: []
            });
          }
        } else {
          return confirmInt.update({ content: "Playback cancelled.", components: [] });
        }
      }
    });

    menuCollector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "You can't use this menu.", ephemeral: true });

      try {
        index = parseInt(interaction.values[0]);
        return interaction.update({
          embeds: [generateEmbed(index)],
          components: generateComponents(index)
        });
      } catch (error) {
        console.error("Menu Interaction Error:", error);
        return interaction.reply({ content: "Failed to switch playlists. Please try again.", ephemeral: true });
      }
    });

    const endCollectors = () => {
      buttonCollector.stop();
      menuCollector.stop();
      msg.edit({ components: [] }).catch(() => {});
    };

    buttonCollector.on("end", endCollectors);
    menuCollector.on("end", endCollectors);
  }
};