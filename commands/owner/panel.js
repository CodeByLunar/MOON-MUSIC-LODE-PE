const Nodeactyl = require("nodeactyl");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const path = require("path");

// Register custom font
registerFont(path.join(__dirname, "../../assets/fonts/manrope.ttf"), { family: "manrope" });

module.exports = {
  name: "panel",
  aliases: ["vps"],
  category: "owner",
  description: "Shows Nodeactyl server stats",
  admin: true,
  owner: true,

  execute: async (client, message, args, emoji) => {
    let emb = new client.embed().desc(`${emoji.cool} **| Fetching server stats...**`);
    let reply = await message.reply({ embeds: [emb] }).catch(() => {});

    const credentials = [
      {
        uri: "https://panel.sillydev.co.uk",
        key: "ptlc_wsirzc4AdRHcBKVSDcNHDVogVlhkMzvCQm5l42fYZTZ",
        id: "3b8df5f7-66f1-4165-b55b-c1456410fff7",
      },
    ];

    let data = [];

    for (let entry of credentials) {
      try {
        let panel = new Nodeactyl.NodeactylClient(entry.uri, entry.key);
        let usages = await panel.getServerUsages(entry.id);
        let details = await panel.getServerDetails(entry.id);

        data.push({
          name: details.name,
          node: details.node,
          uptime: require("ms")(usages.resources.uptime),
          docker: details.docker_image.split(":")[1],
          state: usages.current_state,
          cpu: `${usages.resources.cpu_absolute}/${details.limits.cpu} %vCPU`,
          ram: `${(usages.resources.memory_bytes / 1048576).toFixed(2)}/${details.limits.memory} MiB`,
          disk: `${(usages.resources.disk_bytes / 1048576).toFixed(2)}/${details.limits.disk} MiB`,
          networkTx: `${(usages.resources.network_tx_bytes / 1048576).toFixed(2)} MiB`,
          networkRx: `${(usages.resources.network_rx_bytes / 1048576).toFixed(2)} MiB`,
        });

      } catch (e) {
        data.push({ error: `Error fetching data: ${e.message}` });
      }
    }

    // Generate Image
    const width = 900;
    const height = 500 + data.length * 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background - Black with white glow effect
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = "rgba(255,255,255,0.2)";
    ctx.shadowBlur = 20;

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px CustomFont";
    ctx.fillText("PANEL SERVER STATS", 50, 60);

    let y = 120;
    ctx.font = "25px CustomFont";

    for (let server of data) {
      if (server.error) {
        ctx.fillStyle = "#ff0000";
        ctx.fillText(server.error, 50, y);
        y += 50;
        continue;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`• Name: ${server.name}`, 50, y);
      ctx.fillText(`• Node: ${server.node}`, 50, y + 40);
      ctx.fillText(`• Uptime: ${server.uptime}`, 50, y + 80);
      ctx.fillText(`• Docker: ${server.docker}`, 50, y + 120);
      ctx.fillText(`• State: ${server.state}`, 50, y + 160);
      ctx.fillText(`• CPU: ${server.cpu}`, 50, y + 200);
      ctx.fillText(`• RAM: ${server.ram}`, 50, y + 240);
      ctx.fillText(`• Disk: ${server.disk}`, 50, y + 280);
      ctx.fillText(`• Network TX: ${server.networkTx}`, 50, y + 320);
      ctx.fillText(`• Network RX: ${server.networkRx}`, 50, y + 360);

      y += 400;
    }

    const buffer = canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer, { name: "panel-stats.png" });

    const embed = new client.embed()
      .setTitle("Panel Server Stats")
      .setImage("attachment://panel-stats.png");

    await message.channel.send({ embeds: [embed], files: [attachment] });
    reply.delete().catch(() => {});
  },
};
