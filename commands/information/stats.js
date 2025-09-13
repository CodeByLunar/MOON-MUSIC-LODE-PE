/* made by snow.ded - getto */

const genGraph = require("@gen/pingGraph.js");
const { ActionRowBuilder } = require("discord.js");
const moment = require('moment');


module.exports = {
  name: "stats",
  aliases: ["about", "info", "st"],
  cooldown: "",
  category: "information",
  usage: "",
  description: "Shows bot's shard stats",
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

  
  execute: async (client, message, args, emoji) => {
    let e = new client.embed().desc(
      `<a:loading2:1330742405619646538> — *fetching info for you.. hold tight!*`,
    );
    let wait = await message.reply({ embeds: [e] });


    let v = await client.cluster.broadcastEval(async (x) => {
      let cpu = "[ N/A ]";
      await new Promise(async (resolve, reject) => {
        require("os-utils").cpuUsage((v) => {
          resolve(v);
        });
      }).then((value) => {
        return (cpu = value);
      });

      let users = `> - Users: Users : **\`${(x.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0, ))} users.`

      let stats =
        `
        > *Pookie* is a music bot made with love for people who enjoy rythymically fantastic audio.
        
        > <:rise_discord:1330119359699357810> **[https://discord.gg/lode-pe-moon-music) — <:DGH_add:1330119840786284564> [https://Pookie.gg/invite](https://discord.com/oauth2/authorize?client_id=1281872745113587752&permissions=18021921193297&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2Flode-pe-moon-music&integration_type=0&scope=bot+applications.commands+gdm.join)**`;

      return [stats];
    });

    let statsEmbed = new client.embed()
      //.setImage("https://github.com/snowded/Getto.DiscordBot/blob/main/gettobannernew.png?raw=true")
      .setAuthor({
        name: `Pookie — About.`,
        iconURL: client.user.displayAvatarURL(),
  })
      .setFooter({
        text: `healing mfs through music — 
Pookie...`,
        iconURL: client.user.displayAvatarURL(),
      });
    let nodeStatsEmbed = new client.embed()
      .setAuthor({
        name: `Pookie. — Information.`,
        iconURL: client.user.displayAvatarURL(),
  })
  
      .desc(
        [...client.manager.shoukaku.nodes.values()]
          .map(
            (node, x) =>
              `> - Ping: ${client.ws.ping}ms.
               > - Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB.
               > - Servers: ${client.guilds.cache.size / 1} servers.
               > - Users: ${client.guilds.cache.reduce(
          (total, guild) => total + guild.memberCount,
          0,
        )}
               > - Shards: ${client.manager.shoukaku.nodes.size}.
               > - Players: ${

          [...client.manager.players.values()].filter((p) => p.playing).length

        }/${[...client.manager.players.values()].length}
               > - Channels: ${client.channels.cache.size} channels.
               > - Created: <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>.
               > - Uptime: ${client.formatTime(client.uptime)}.
               > - Commands: ${client.commands.size}.
            `,
          )
          .join("\n\n"),
      )
      .setFooter({
        text: `healing mfs through music — Pookie.`,
      });

    const uri = await genGraph(
      client.ws.ping,
      wait.createdAt - message.createdAt,
    );
    const graphEmbed = new client.embed().setAuthor({
      name: `Pookie. — Developer.`,
      iconURL: client.user.displayAvatarURL(),
}).desc(
      `<:dottutu:1330120407424176150>\`:\` **Below is the info about the Bot Developer.**\n\n` + 
      `<:code:1330117890409631754> **Owner & Developer**\n` +
      `**\`・\` [Afjal Gamer](https://discord.com/users/1293144836299558931)**\n` +    
      `**\`・\` [deepjyoti](https://discord.com/users/1064033717561081856)**\n` +             `<:rdx_white_arrow:1330118284049383495> **Status : <a:zzkittysleeping:1330118142235512903> Sleeping Zzz**\n` +
      `> -# Socials \`:\` [insta](soon) — [Discord](https://discord.gg/lode-pe-moon-music) — [Guns](https://guns.lol)`
    ).thumb(client.user.displayAvatarURL()).setFooter({
      text: `healing mfs through music — Pookie.`,
      iconURL: client.user.displayAvatarURL(),
    });

    for (i = 0; i < v.length; i++) {
      statsEmbed.addFields({
        name: ` `,
        value: `
        > <:rdx_white_arrow:1330118284049383495> **Pookie is a music bot made with love for people who enjoy rythymically fantastic audio.**
        
        > <a:discord:1350322004657438801> **[Pookie.gg/support](https://discord.gg/lode-pe-moon-music) — <:DGH_add:1330119840786284564> [Pookie.gg/invite](https://discord.com/oauth2/authorize?client_id=1281872745113587752&permissions=18021921193297&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2Flode-pe-moon-music&integration_type=0&scope=bot+applications.commands+gdm.join)**`,
        inline: false,
      });
    }

    let page = 0;
    let pages = [statsEmbed, nodeStatsEmbed, graphEmbed];

    const btn1 = new client.button().primary(`stats`, ``, `<:tutuhome:1271864355771908166>`);
    const btn2 = new client.button().primary(`node`, `Information`);
    const btn3 = new client.button().primary(`graph`, `About Developer`, `<:tutucode:1270710529933185096>`);
    const btn4 = new client.button().danger(`stop`, ``, `<:gettostop:1277360986025627658>`);

    const row = new ActionRowBuilder().addComponents(btn1, btn2, btn3, btn4);

    let m = await wait
      .edit({ embeds: [pages[page]], components: [row] })
      .catch(() => {});

    const filter = async (interaction) => {
      if (interaction.user.id === message.author.id) {
        return true;
      }
      await interaction
        .reply({
          embeds: [
            new client.embed().desc(
              `Only **${message.author.tag}** can use this`,
            ),
          ],
          ephemeral: true,
        })
        .catch(() => {});
      return false;
    };
    const collector = m?.createMessageComponentCollector({
      filter: filter,
      time: 100000,
      idle: 200000 / 2,
    });

    collector?.on("collect", async (c) => {
      if (!c.deferred) await c.deferUpdate();

      switch (c.customId) {
        case "stats":
          page = 0;
          await m.edit({ embeds: [pages[page]] }).catch(() => {});
          break;

        case "node":
          page = 1;
          await m.edit({ embeds: [pages[page]] }).catch(() => {});
          break;

        case "graph":
          page = 2;
          await m.edit({ embeds: [pages[page]] }).catch(() => {});
          break;

        case "stop":
          await collector.stop();
          break;

        default:
          break;
      }
    });

    collector?.on("end", async (collected, reason) => {
      await m
        .edit({
          components: [],
        })
        .catch(() => {});
    });
  },
};