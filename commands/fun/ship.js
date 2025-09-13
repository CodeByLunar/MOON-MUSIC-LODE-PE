const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ship",
  description: "Check the compatibility between two users!",
  usage: "ship [@user1] [@user2]",
  userPerms: [],
  botPerms: ["AttachFiles"],
  owner: false,
  execute: async (client, message, args) => {
    try {
      let user1 = message.mentions.users.first();
      let user2 = message.mentions.users.at(1);

      if (!user1 || !user2) {
        const members = message.guild.members.cache.filter(m => !m.user.bot).random(2);
        if (members.length < 2) return message.reply("Not enough members in the server!");
        user1 = members[0].user;
        user2 = members[1].user;
      }

      // Generate random compatibility percentage
      const percentage = Math.floor(Math.random() * 101);

      const canvas = Canvas.createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      // Load background image from local file
      const backgroundPath = path.join('/home/container/assets', 'ship_background.png');
      if (!fs.existsSync(backgroundPath)) {
        return message.reply("Background image not found in assets folder!");
      }
      const background = await Canvas.loadImage(backgroundPath);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Load user avatars
      let avatar1, avatar2;
      try {
        avatar1 = await Canvas.loadImage(user1.displayAvatarURL({ extension: "png", size: 256 }));
        avatar2 = await Canvas.loadImage(user2.displayAvatarURL({ extension: "png", size: 256 }));
      } catch (error) {
        console.error("Avatar load error:", error);
        return message.reply("Error loading user avatars.");
      }

      // Draw user avatars
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 100, 100, 200, 200);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 200, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 500, 100, 200, 200);
      ctx.restore();

      // Load and draw the heart image from local file
      const heartPath = path.join('/home/container/assets', 'ship_heart.png');
      if (!fs.existsSync(heartPath)) {
        return message.reply("Heart image not found in assets folder!");
      }
      const heartImage = await Canvas.loadImage(heartPath);
      ctx.drawImage(heartImage, 340, 100, 120, 200);

      // Draw text
      ctx.font = "40px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${percentage}%`, 400, 80);

      ctx.font = "30px Arial";
      ctx.fillText(`${user1.username} & ${user2.username}`, 400, 350);
      ctx.font = "25px Arial";
      ctx.fillText("Meant to be together...", 400, 380);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "ship.png" });

      // Create Embed
      const embed = new EmbedBuilder()
        .setColor("#ff69b4")
        .setTitle("<a:cute:1349433578731081799> Love Compatibility Test <a:cute:1349433578731081799>")
        .setDescription(`${user1} and ${user2} are **${percentage}%** compatible! ❤️`)
        .setImage("attachment://ship.png")
        .setFooter({ text: "Made with ryxx" })
        .setTimestamp();

      message.reply({ embeds: [embed], files: [attachment] });

    } catch (err) {
      console.error("Ship command error:", err);
      message.reply("Something went wrong! Please try again.");
    }
  },
};