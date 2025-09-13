const genCommandList = require("@gen/commandList.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  cooldown: "5",
  category: "information",
  usage: "",
  description: "Shows bot's help menu",
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
    // Initialize emoji object with priority to music, filter, playlist
    emoji = {
      music: "<:music:1358413345656541285>",
      filter: "<:icon_filter:1364317363142660146>",
      Playlist: "<:music_queue:1358413151418318919>", // Fixed playlist emoji
      fun: "<:icons_games:1358413120569344191>",
      Utility: "<:icons_list:1358413026734243851>",
      information: "<:info:1358412788686389430>",
      config: "<:settings:1358413720740434073>",
      spotify: "<:Icon_Spotify:1365579283719786599>",
      owner: "<:Icons_Guardian:1358412686509080617>",
      ...(emoji || {})
    };

    // Get categories and filter out owner
    let categories = Array.from(client.categories || []).filter(c => c !== "owner");
    
    // Define EXACT order you want (Music, Filter, Playlist first)
    const priorityOrder = ["music", "filter", "Playlist"];
    
    // Sort categories with priority ones first, then others alphabetically
    categories = [
      ...priorityOrder.filter(cat => categories.includes(cat)),
      ...categories.filter(cat => !priorityOrder.includes(cat))
                  .sort((a, b) => a.localeCompare(b))
    ];

    // Create categories list for embed
    let cat = categories
      .map(
        (c) =>
          `> ${emoji[c] || '❓'}  ${
            c.charAt(0).toUpperCase() + c.slice(1)
          } \n`,
      )
      .join("");

    // Main help embed
    const embed = new client.embed()
      .setDescription(`**__Pookie is an advanced Music bot with best reconnection and Beautiful Music quality.__**\n<:icon_right_arrow:1358737923159097445> __Prefix for This server:__ \`+\`\n
**__Modules__**\n${cat}
**__Links__**\n > [Invite](https://discord.com/oauth2/authorize?client_id=1281872745113587752&permissions=18021921193297&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2Flode-pe-moon-music&integration_type=0&scope=bot+applications.commands+gdm.join) | [Support](https://discord.gg/lode-pe-moon-music) | [Vote](https://top.gg/bot/1281872745113587752)`)
      .setThumbnail(client.user.displayAvatarURL())
      .img(
        "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&",
      );

    // Prepare command lists for all categories (including playlist)
    let arr = [];
    for (let category of categories) {
      let cmnds = client.commands.filter((c) => c.category == category);
      arr.push(cmnds.map((c) => `\`${c.name}\``));
    }

    // Create "all commands" embed (now includes playlist)
    let allCmds = categories.map(
      (cat, i) =>
        `${emoji[cat] || '❓'} __**${cat.charAt(0).toUpperCase() + cat.slice(1)}**__\n${arr[i].join(", ")}`
    );
    let desc = allCmds.join("\n\n");

    const all = new client.embed()
      .setDescription(desc)
      .img(
        "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&",
      );

    // Buttons
    const homeButton = new ButtonBuilder()
      .setCustomId("home")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('<:home:1358412277283557577>')
      .setLabel("Home");
      
    const allButton = new ButtonBuilder()
      .setCustomId("all")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('1134540425168945226')
      .setLabel("Commands List");

    // Create dropdown menu with properly ordered categories (including playlist with emoji)
    const selectMenuOptions = categories.map((category) => {
      const categoryEmoji = emoji[category];
      let emojiId = null;
      
      if (typeof categoryEmoji === 'string') {
        emojiId = categoryEmoji;
      } else if (categoryEmoji?.id) {
        emojiId = categoryEmoji.id;
      }
      
      return {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
        emoji: emojiId || undefined
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("categorySelect")
      .setPlaceholder("Select a category")
      .addOptions(selectMenuOptions);

    const row1 = new ActionRowBuilder().addComponents(homeButton, allButton);
    const row3 = new ActionRowBuilder().addComponents(selectMenu);

    // Send the help message
    const m = await message.reply({
      embeds: [embed],
      components: [row1, row3],
    });

    // Interaction filter
    const filter = async (interaction) => {
      if (interaction.user.id === message.author.id) {
        return true;
      }
      await interaction.message.edit({
        components: [row1, row3],
      });
      await interaction
        .reply({
          embeds: [
            new client.embed().setDescription(
              `${emoji.no} Only **${message.author.tag}** can use this`
            ),
          ],
          ephemeral: true,
        })
        .catch(() => {});
      return false;
    };

    // Create collector for interactions
    const collector = m?.createMessageComponentCollector({
      filter: filter,
      time: 60000,
      idle: 60000 / 2,
    });

    // Handle interactions (including playlist)
    collector?.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      const category = interaction.customId === "categorySelect" ? interaction.values[0] : interaction.customId;

      switch (category) {
        case "home":
          await m.edit({ embeds: [embed] }).catch(() => {});
          break;

        case "all":
          await m.edit({ embeds: [all] }).catch(() => {});
          break;

        case "music":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Music Commands**__`)
                .setDescription(await genCommandList(client, "music"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "filter":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Filter Commands**__`)
                .setDescription(await genCommandList(client, "filter"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "Playlist":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Playlist Commands**__`)
                .setDescription(await genCommandList(client, "Playlist"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "fun":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Fun Commands**__`)
                .setDescription(await genCommandList(client, "fun"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "utility":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Utility Commands**__`)
                .setDescription(await genCommandList(client, "utility"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "information":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Information Commands**__`)
                .setDescription(await genCommandList(client, "information"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        case "config":
          await m.edit({
            embeds: [
              new client.embed()
                .setTitle(`__**Config Commands**__`)
                .setDescription(await genCommandList(client, "config"))
                .img(
                  "https://cdn.discordapp.com/attachments/1347273140035649587/1350029807546798161/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d540bc&is=67d3ef3c&hm=9b35462067347a5eda4a40d62f6069a1aa9f78cc0f4669c38702a8f26a3da5b5&"
                ),
            ],
          }).catch(() => {});
          break;

        default:
          break;
      }
    });

    // Clean up when collector ends
    collector?.on("end", async () => {
      await m.edit({ components: [] }).catch(() => {});
    });
  },
};