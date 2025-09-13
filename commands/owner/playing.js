const { ActionRowBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");

module.exports = {
  name: "playing",
  aliases: ["nowplaying"],
  category: "owner",
  description: "Shows the currently playing servers with their songs",
  owner: true,

  execute: async (client, message) => {
    let players = [...client.manager.players]
      .map((e) => e[1])
      .filter((p) => p.playing)
      .map((p) => ({
        id: p.guildId,
        track: p.queue.current ? p.queue.current.title : "Unknown Track",
      }));

    if (players.length === 0) {
      return message.reply({
        embeds: [new client.embed().setDescription("No servers are currently playing music.")],
      });
    }

    let page = 0;
    const perPage = 10;
    const totalPages = Math.ceil(players.length / perPage);

    const generateCanvas = async (pageIndex) => {
      const canvas = Canvas.createCanvas(800, 600);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#202225";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Currently Playing Servers", 20, 40);

      let start = pageIndex * perPage;
      let end = start + perPage;
      let displayPlayers = players.slice(start, end);

      ctx.font = "20px Arial";
      let y = 80;
      for (const { id, track } of displayPlayers) {
        let guild = client.guilds.cache.get(id);
        let name = guild ? guild.name.substring(0, 50) : "Unknown Server";
        ctx.fillText(`• ${name} - ${track}`, 40, y);
        y += 40;
      }

      return new AttachmentBuilder(canvas.toBuffer(), { name: "playing.png" });
    };

    const updateMessage = async (pageIndex) => {
      const image = await generateCanvas(pageIndex);
      let row = new ActionRowBuilder().addComponents(
        new client.button().primary("refresh", "Refresh")
      );

      if (players.length > perPage) {
        row.addComponents(
          new client.button().secondary("prev", "Previous").setDisabled(pageIndex === 0),
          new client.button().secondary("next", "Next").setDisabled(pageIndex === totalPages - 1)
        );
      }

      await msg.edit({
        embeds: [new client.embed().setDescription(`Page ${pageIndex + 1}/${totalPages}`).setImage("attachment://playing.png")],
        files: [image],
        components: [row],
      });
    };

    const image = await generateCanvas(page);
    let row = new ActionRowBuilder().addComponents(new client.button().primary("refresh", "Refresh"));

    if (players.length > perPage) {
      row.addComponents(
        new client.button().secondary("prev", "Previous").setDisabled(page === 0),
        new client.button().secondary("next", "Next").setDisabled(page === totalPages - 1)
      );
    }

    let msg = await message.reply({
      embeds: [new client.embed().setDescription(`Page ${page + 1}/${totalPages}`).setImage("attachment://playing.png")],
      files: [image],
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      switch (interaction.customId) {
        case "refresh":
          return updateMessage(page);
        case "prev":
          if (page > 0) {
            page--;
            return updateMessage(page);
          }
          break;
        case "next":
          if (page < totalPages - 1) {
            page++;
            return updateMessage(page);
          }
          break;
        case "close":
          collector.stop();
          await msg.edit({ components: [] }).catch(() => {});
          break;
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
