/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const genButtons = require("@gen/playerButtons.js");

module.exports = async (data, client, player) => {
  const title = data.title;
  const author = data.author;
  const duration = data.duration;
  const source = data.source;

  const thumbs = {
    youtube:
      "https://media.discordapp.net/attachments/1188399617121984542/1192720573231538216/yt1.png",
    soundcloud:
      "https://media.discordapp.net/attachments/1188399617121984542/1192720572329762937/soundcloud.png",
    spotify:
      "https://media.discordapp.net/attachments/1188399617121984542/1192720573231538216/yt1.png",
    deezer:
      "https://media.discordapp.net/attachments/1188399617121984542/1192720855847940106/image.png",
    nicovideo:
      "https://media.discordapp.net/attachments/1188399617121984542/1192720572052947084/nicovideo.png",
  };

  let thumb = thumbs[`${source}`];

  const embed = new client.embed()
    .thumb(thumb)
    .desc(
      `### I am currently playing \n` +
        `**<a:song:1367927649120550943> Name: [${
          title.charAt(0).toUpperCase() +
          title.substring(0, 20).slice(1).toLowerCase()
        }](https://x.x.x.)\n` +
        `<:author:1367927143023120485> Author: ${
          author.charAt(0).toUpperCase() +
          author.substring(0, 12).slice(1).toLowerCase()
        }\n` +
        `<:duration:1367928204307992658> Duration: \`${duration}\`**`
    )
    .img("https://cdn.discordapp.com/attachments/1347527944171683921/1350133910494904320/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d5a1b0&is=67d45030&hm=3d48350569f9421a97f040bc46a4939d58b69c47beb6575eecea7e1491db4332&") 
    .setFooter({ text: "Enjoy your music! with Pookie" });

  return [[embed], [], [genButtons(client, player, 4)[0]]];
};
