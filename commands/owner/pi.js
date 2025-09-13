const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
const os = require("os");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

module.exports = {
  name: "pi",
  aliases: [],
  cooldown: "",
  category: "owner",
  usage: "",
  description: "Fetch bot statistics",
  args: false,
  vote: false,
  new: false,
  admin: true,
  owner: true,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args, emoji) => {
    const m = await message.reply("Fetching bot statistics...");

    // Helper Functions
    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024,
        dm = decimals < 0 ? 0 : decimals,
        sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const os = require("os");
const osu = require("os-utils");

module.exports = {
  name: "pi",
  aliases: [],
  category: "owner",
  description: "Displays bot statistics with a combined system graph.",
  owner: true,
  execute: async (client, message) => {
    const m = await message.reply("Fetching bot statistics...");

    // Get Bot Stats
    const ping = client.ws.ping;
    const cpuUsage = await new Promise((resolve) => osu.cpuUsage((v) => resolve(v * 100)));
    const totalMem = os.totalmem() / 1024 / 1024; // MB
    const freeMem = os.freemem() / 1024 / 1024; // MB
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // Graph Data
    const labels = ["Ping (ms)", "CPU (%)", "RAM (%)"];
    const data = [ping, cpuUsage.toFixed(2), memUsagePercent.toFixed(2)];
    const width = 600;
    const height = 300;

    // Generate Graph Image
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    const config = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Bot Statistics",
            data,
            backgroundColor: ["#ffcc00", "#ff5733", "#3498db"],
            borderWidth: 1,
          },
        ],
      },
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(config);
    const attachment = new AttachmentBuilder(buffer, { name: "stats.png" });

    // Embed with Image
    const embed = new EmbedBuilder()
      .setTitle("📊 Bot Performance Statistics")
      .setColor("#5865F2")
      .setDescription(
        `**📡 Ping:** ${ping}ms\n` +
        `**🖥 CPU Usage:** ${cpuUsage.toFixed(2)}%\n` +
        `**💾 RAM Usage:** ${usedMem.toFixed(2)}/${totalMem.toFixed(2)} MB (${memUsagePercent.toFixed(2)}%)\n`
      )
      .setImage("attachment://stats.png")
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    // Buttons for More Info
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("more_details").setLabel("More Details").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("technical_details").setLabel("Technical Info").setStyle(ButtonStyle.Secondary)
    );

    await m.edit({ content: "", embeds: [embed], files: [attachment], components: [row] });
  },
};

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const generateGraph = async (data, label, color) => {
      const width = 400;
      const height = 200;
      const chart = new ChartJSNodeCanvas({ width, height });
      return chart.renderToBuffer({
        type: "line",
        data: {
          labels: ["10s ago", "8s ago", "6s ago", "4s ago", "2s ago", "Now"],
          datasets: [{ label, data, borderColor: color, fill: false }],
        },
        options: { plugins: { legend: { display: false } } },
      });
    };

    // ** Main Stats Image **
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#2c2f33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Pookie Bot Statistics", 20, 40);

    // Details
    ctx.font = "16px Arial";
    ctx.fillText(`Node.js: ${process.version}`, 20, 80);
    ctx.fillText(`D.js: v${require("discord.js").version}`, 20, 110);
    ctx.fillText(`Platform: ${process.platform}`, 20, 140);
    ctx.fillText(`CPU Usage: ${Math.round(os.loadavg()[0] * 100)}%`, 20, 170);
    ctx.fillText(`RAM Usage: ${formatBytes(process.memoryUsage().rss)}`, 20, 200);

    // Attach main stats image
    const mainStatsAttachment = new AttachmentBuilder(canvas.toBuffer(), { name: "stats.png" });

    // ** Generate Graphs **
    const pingGraph = await generateGraph([120, 110, 90, 100, 80, client.ws.ping], "Ping (ms)", "blue");
    const cpuGraph = await generateGraph([40, 50, 30, 45, 60, os.loadavg()[0] * 100], "CPU Usage (%)", "red");
    const ramGraph = await generateGraph([1024, 2048, 3072, 4096, 5120, process.memoryUsage().rss / 1024 / 1024], "RAM Usage (MB)", "green");

    // Attach graph images
    const pingAttachment = new AttachmentBuilder(pingGraph, { name: "ping.png" });
    const cpuAttachment = new AttachmentBuilder(cpuGraph, { name: "cpu.png" });
    const ramAttachment = new AttachmentBuilder(ramGraph, { name: "ram.png" });

    // ** Buttons **
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("more_details").setLabel("More Details").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("extra_details").setLabel("Even More Details").setStyle(ButtonStyle.Secondary),
    );

    // ** Main Embed **
    const embed = new client.embed()
      .setTitle("📊 Pookie Bot Stats")
      .setDescription(`Here are the latest bot statistics:`)
      .setImage("attachment://stats.png")
      .setColor("#5865F2")
      .setFooter({ text: "Powered by Pookie" });

    await m.edit({
      embeds: [embed],
      components: [row],
      files: [mainStatsAttachment],
    });

    // ** Button Interaction Handler **
    const collector = m.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "more_details") {
        const embed2 = new client.embed()
          .setTitle("📈 Performance Metrics")
          .setDescription("Here are more detailed performance stats.")
          .setImage("attachment://ping.png")
          .setColor("#FEE75C");

        await interaction.update({
          embeds: [embed2],
          files: [pingAttachment],
        });
      } else if (interaction.customId === "extra_details") {
        const embed3 = new client.embed()
          .setTitle("📉 CPU & RAM Usage")
          .setDescription("Advanced system usage details.")
          .addFields(
            { name: "CPU Usage", value: `${Math.round(os.loadavg()[0] * 100)}%`, inline: true },
            { name: "RAM Usage", value: `${formatBytes(process.memoryUsage().rss)}`, inline: true },
          )
          .setImage("attachment://cpu.png")
          .setColor("#FF5733");

        await interaction.update({
          embeds: [embed3],
          files: [cpuAttachment, ramAttachment],
        });
      }
    });
  },
};
