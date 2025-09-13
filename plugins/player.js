
const { Connectors } = require("shoukaku");
const { Kazagumo, Plugins } = require("kazagumo");

module.exports = player = (client) => {
  client.manager = new Kazagumo(
    {
      plugins: [
        new (require("kazagumo-apple"))({
          countryCode: "us",
          imageWidth: 600,
          imageHeight: 900,
        }),
        new (require("kazagumo-filter"))(),
        new (require("kazagumo-deezer"))({
          playlistLimit: 20,
        }),
        new (require("kazagumo-spotify"))({
          searchLimit: 30,
          albumPageLimit: 5,
          searchMarket: "IN",
          playlistPageLimit: 5,
          clientId: client.config.spotify.id,
          clientSecret: client.config.spotify.secret,
        }),
        new Plugins.PlayerMoved(client),
      ],
      send: (guildId, payload, important) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      defaultSearchEngine: "youtube",
    },
    new Connectors.DiscordJS(client),
    [
      {
        name: "Sofia",
        url: "gh46.glacierhosting.org:25602",
        auth: "RamRam",
        secure: false,
      },
    ]
  );

  client.manager.searchSpotify = async (query, requester) => {
    const searchResult = await client.manager.search(query, requester, {
      engine: "youtube",
    });
    return searchResult;
  };
};
