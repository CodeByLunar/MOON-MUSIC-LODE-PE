const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  category: "music",
  description: "Shows the current queue visually using Canvas with a custom banner",
  botPerms: [],
  userPerms: [],
  player: true,
  queue: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args, emoji) => {
    const player = await client.getPlayer(message.guild.id);
    if (!player || !player.queue.size) 
      return message.reply({ content: `${emoji.no} **Queue is empty!**` });

    let queue = player.queue.map((t, i) => ({
      title: t.title.length > 50 ? t.title.substring(0, 50) + "..." : t.title,
      duration: t.isStream ? "LIVE" : client.formatTime(t.length),
      thumbnail: t.thumbnail,
      index: i + 1,
    }));

    const itemsPerPage = 5;
    let currentPage = 0;
    const totalPages = Math.ceil(queue.length / itemsPerPage);

    const loadingMessage = await message.reply({ content: "<a:loading:1331908484471717919> Generating queue image, please wait..." });

    const generateQueueImage = async (page) => {
      const canvas = createCanvas(900, 600);
      const ctx = canvas.getContext("2d");

      const bannerImage = await loadImage("./assets/cards/Queqe.png"); 
      ctx.drawImage(bannerImage, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 35px Arial";
      ctx.fillText("🎶 Music Queue", 40, 50);

      ctx.fillStyle = "#F1C40F";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Now Playing:", 40, 100);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "22px Arial";
      ctx.fillText(
        `${player.queue.current.title.length > 50 ? player.queue.current.title.substring(0, 50) + "..." : player.queue.current.title} - [${player.queue.current.isStream ? "LIVE" : client.formatTime(player.queue.current.length)}]`,
        40,
        135
      );

      const nowPlayingThumb = await loadImage(player.queue.current.thumbnail);
      ctx.drawImage(nowPlayingThumb, 750, 70, 100, 100);

      ctx.fillStyle = "#F1C40F";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Up Next:", 40, 200);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "20px Arial";

      let pageQueue = queue.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
      if (pageQueue.length === 0) {
        ctx.fillText("No more songs in the queue!", 40, 250);
      } else {
        const images = await Promise.all(pageQueue.map((song) => loadImage(song.thumbnail)));
        for (let i = 0; i < pageQueue.length; i++) {
          ctx.drawImage(images[i], 40, 230 + i * 70, 50, 50);
          ctx.font = "22px Arial";
          ctx.fillText(`#${pageQueue[i].index}: ${pageQueue[i].title} - [${pageQueue[i].duration}]`, 110, 265 + i * 70);
        }
      }

      ctx.fillStyle = "#CCCCCC";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`Page ${page + 1}/${totalPages}`, canvas.width - 140, canvas.height - 20);

      return new AttachmentBuilder(canvas.toBuffer(), { name: "queue.png" });
    };

    let queueImage = await generateQueueImage(currentPage);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("prev").setLabel("◀ Previous").setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
      new ButtonBuilder().setCustomId("next").setLabel("Next ▶").setStyle(ButtonStyle.Primary).setDisabled(totalPages <= 1)
    );

    await loadingMessage.edit({ content: "", files: [queueImage], components: [row] });

    const collector = loadingMessage.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) return interaction.reply({ content: "You can't use this!", ephemeral: true });

      if (interaction.customId === "prev" && currentPage > 0) currentPage--;
      if (interaction.customId === "next" && (currentPage + 1) < totalPages) currentPage++;

      queueImage = await generateQueueImage(currentPage);

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled((currentPage + 1) >= totalPages);

      await interaction.update({ files: [queueImage], components: [row] });
    });

    collector.on("end", async () => {
      row.components.forEach((btn) => btn.setDisabled(true));
      await loadingMessage.edit({ components: [row] }).catch(() => {});
    });
  },
};
