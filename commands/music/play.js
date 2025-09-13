const yt = /^(?:(?:(?:https?:)?\/\/)?(?:www\.)?)?(?:youtube\.com\/(?:[^\/\s]+\/\S+\/|(?:c|channel|user)\/\S+|embed\/\S+|watch\?(?=.*v=\S+)(?:\S+&)*v=\S+)|(?:youtu\.be\/\S+)|yt:\S+)$/i;
const appleMusic = /^(https?:\/\/)?(www\.)?music\.apple\.com\/([a-z]{2}\/)?(album|song|playlist)\/.+$/i;
const spotify = /^(https?:\/\/)?(www\.)?open\.spotify\.com\/(track|album|playlist)\/.+$/i;
const soundcloud = /^(https?:\/\/)?(www\.)?soundcloud\.com\/.+/i;
const songStatsDB = require("../../database/songStats");

module.exports = {
    name: "play",
    aliases: ["p"],
    cooldown: "",
    category: "music",
    usage: "",
    description: "Play a song or playlist from a URL or search query.",
    args: false,
    vote: false,
    new: true,
    admin: false,
    owner: false,
    botPerms: [],
    userPerms: [],
    player: false,
    queue: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,

    execute: async (client, message, args, emoji) => {
        const { channel } = message.member.voice;
        const file = await message.attachments;
        const query = [...file]?.[0] ? [...file][0][1].attachment : args.join(" ");

        if (!query) {
            return message.reply({
                embeds: [new client.embed().desc(`${emoji.bell} **No query! Try a radio: \`${client.prefix}radio\`**`)],
            }).catch(() => {});
        }

        let replyMsg = null;
        if (yt.test(query)) {
            if (!(await client.db.premium.get(`${client.user.id}_${message.author.id}`))) {
                return message.reply({
                    embeds: [new client.embed().desc(`${emoji.warn} **This provider is against ToS**`)],
                }).catch(() => {});
            }

            replyMsg = await message.reply({
                embeds: [new client.embed().desc(`${emoji.warn} **This provider is against ToS!**\n${emoji.bell} Retrieving metadata to play from a different source.`)],
            }).catch(() => {});
        }

        const loading = {
            embeds: [new client.embed().desc(`${emoji.search} **Searching, please wait...**`)],
        };

        replyMsg = replyMsg
            ? await replyMsg.edit(loading).catch(() => {})
            : await message.reply(loading).catch(() => {});

        const player = await client.manager.createPlayer({
            voiceId: channel.id,
            textId: message.channel.id,
            guildId: message.guild.id,
            shardId: message.guild.shardId,
            loadBalancer: true,
            deaf: true,
        });

        // Handle search query cleaning
        let searchQuery = query;
        try {
            const url = new URL(query);

            if (appleMusic.test(query)) {
                searchQuery = `https://music.apple.com${url.pathname}`; // Clean Apple Music link
            } else if (spotify.test(query)) {
                searchQuery = `https://open.spotify.com${url.pathname}`; // Clean Spotify link
            } else if (soundcloud.test(query)) {
                searchQuery = `https://soundcloud.com${url.pathname}`; // Clean SoundCloud link
            }
        } catch (e) {
            // Not a URL, ignore
        }

        const result = await player.search(searchQuery, {
            requester: message.author,
        });

        if (!result.tracks.length) {
            return replyMsg
                ? await replyMsg.edit({
                      embeds: [new client.embed().desc(`${emoji.no} **No results found for query!**`)],
                  }).catch(() => {})
                : await message.reply({
                      embeds: [new client.embed().desc(`${emoji.no} **No results found for query!**`)],
                  }).catch(() => {});
        }

        const tracks = result.tracks;

        if (result.type === "PLAYLIST") {
            for (const track of tracks) {
                await player.queue.add(track);
                await savePlayedSong(message.author.id, track.title);
            }
        } else {
            if (tracks[0].length < 10000) {
                return message.reply({
                    embeds: [new client.embed().desc(`${emoji.no} **Songs shorter than \`30s\` cannot be played!**`)],
                }).catch(() => {});
            }
            await player.queue.add(tracks[0]);
            await savePlayedSong(message.author.id, tracks[0].title);
        }

        const added = result.type === "PLAYLIST"
            ? {
                  embeds: [new client.embed().desc(`${emoji.yes} **Added ${tracks.length} tracks from** ${result.playlistName || 'the playlist'} **to queue.**`)],
              }
            : {
                  embeds: [new client.embed().desc(`${emoji.yes} **Added to queue:** ${tracks[0].title.replace(/[[\]]/g, "")}`)],
              };

        if (!player.playing && !player.paused) player.play();
        replyMsg
            ? await replyMsg.edit(added).catch(() => {})
            : await message.reply(added).catch(() => {});
    },
};

async function savePlayedSong(userId, songName) {
    let songStats = (await songStatsDB.get(userId)) || {};
    songStats[songName] = (songStats[songName] || 0) + 1;
    await songStatsDB.set(userId, songStats);
}