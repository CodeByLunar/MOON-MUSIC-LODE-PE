const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const axios = require('axios');
const SpotifyUser = require('../../database/spotifyUser.js'); // Path to your model

module.exports = {
  name: 'login',
  aliases: ['spotifylogin', 'slogin'],
  category: 'spotify',
  description: 'Link your Spotify profile to your Discord account.',
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  usage: '<Spotify Profile URL>',
  cooldown: 5,

  execute: async (client, message, args) => {
    const clientId = 'e6f84fbec2b44a77bf35a20c5ffa54b8';
    const clientSecret = '498f461b962443cfaf9539c610e2ea81';

    const getSpotifyToken = async () => {
      const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const res = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${encoded}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return res.data.access_token;
    };

    const input = args[0];
    if (!input || !input.includes('spotify.com/user')) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Invalid Spotify URL')
            .setDescription(
              'Please provide a valid Spotify user profile URL.\n\nExample:\n`login https://open.spotify.com/user/your_id_here`'
            )
            .setColor('#1DB954'),
        ],
      });
    }

    const match = input.match(/spotify\.com\/user\/([a-zA-Z0-9]+)/);
    if (!match || !match[1]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Malformed URL')
            .setDescription("Couldn't extract Spotify ID from the link. Please check the format.")
            .setColor('#1DB954'),
        ],
      });
    }

    const spotifyId = match[1];
    
    try {
      // Check if user already exists
      const existingUser = await SpotifyUser.findOne({ 
        $or: [
          { discordId: message.author.id },
          { spotifyId: spotifyId }
        ]
      });

      if (existingUser) {
        let description;
        if (existingUser.discordId === message.author.id && existingUser.spotifyId === spotifyId) {
          description = `You're already linked to [${existingUser.displayName}](${existingUser.profileUrl})`;
        } else if (existingUser.discordId === message.author.id) {
          description = `You're already linked to a different Spotify account: [${existingUser.displayName}](${existingUser.profileUrl})`;
        } else {
          description = 'This Spotify account is already linked to another Discord user.';
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Already Linked')
              .setDescription(description)
              .setColor('#1DB954'),
          ],
        });
      }

      // Fetch Spotify profile
      let profile;
      try {
        const token = await getSpotifyToken();
        const res = await axios.get(
          `https://api.spotify.com/v1/users/${spotifyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        profile = res.data;
      } catch (err) {
        console.error(err?.response?.data || err);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Fetch Failed')
              .setDescription("Couldn't fetch Spotify user data. Check if the profile exists and is public.")
              .setColor('#1DB954'),
          ],
        });
      }

      // Create new user record
      const newUser = new SpotifyUser({
        discordId: message.author.id,
        spotifyId: profile.id,
        displayName: profile.display_name || 'Unknown',
        followers: profile.followers?.total || 0,
        profileUrl: profile.external_urls?.spotify,
        avatar: profile.images?.[0]?.url || null,
      });

      await newUser.save();

      // Create response with buttons
      const viewBtn = new ButtonBuilder()
        .setLabel('View Profile')
        .setStyle(ButtonStyle.Link)
        .setURL(newUser.profileUrl);

      const unlinkBtn = new ButtonBuilder()
        .setLabel('Unlink')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('unlink_spotify');

      const row = new ActionRowBuilder().addComponents(viewBtn, unlinkBtn);

      const embed = new EmbedBuilder()
        .setTitle('Spotify Profile Linked')
        .setDescription('Successfully linked your Spotify account.')
        .addFields(
          { name: 'Display Name', value: newUser.displayName, inline: true },
          { name: 'Followers', value: newUser.followers.toString(), inline: true }
        )
        .setThumbnail(newUser.avatar)
        .setColor('#1DB954')
        .setFooter({
          text: `Linked to: ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });

      const msg = await message.channel.send({ embeds: [embed], components: [row] });

      // Button interaction handler
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'unlink_spotify') {
          if (i.user.id !== message.author.id) {
            return i.reply({ content: "You can't unlink someone else's Spotify.", ephemeral: true });
          }

          await SpotifyUser.deleteOne({ discordId: message.author.id });

          const updatedEmbed = new EmbedBuilder()
            .setTitle('Spotify Profile Unlinked')
            .setDescription('Your Spotify account has been successfully unlinked.')
            .setColor('#1DB954');

          return i.update({ embeds: [updatedEmbed], components: [] });
        }
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          viewBtn.setDisabled(true),
          unlinkBtn.setDisabled(true)
        );
        await msg.edit({ components: [disabledRow] }).catch(() => {});
      });

    } catch (error) {
      console.error('Error in login command:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('An error occurred while processing your request. Please try again later.')
            .setColor('#FF0000'),
        ],
      });
    }
  },
};