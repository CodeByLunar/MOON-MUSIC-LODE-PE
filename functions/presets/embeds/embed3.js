/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const genButtons = require("@gen/playerButtons.js");
const { AttachmentBuilder } = require("discord.js");

module.exports = async (data, client, player) => {
  /*
  const title = data.title;
  const author = data.author;
  const thumbnail = data.thumbnail;
  const duration = data.duration;
  const color = data.color;
  const progress = data.progress;
  const source = data.source;
  */

  const title = data.title;
  const author = data.author;
  const duration = data.duration;
  const thumbnail = data.thumbnail;

  const embed = new client.embed()
    .addFields([
      {
        name: `<a:song:1367927649120550943> **Now Playing..**`,
        value:
          `<a:song:1367927649120550943> **__Song__ :** ${title.substring(0, 20)}...\n` +
          `<:author:1367927143023120485> **__Author__ :** ${author}\n` +
          `<:duration:1367928204307992658> **__Duration__ :** ${duration}\n` +
          `<a:emoji:1367927270747934761> **__Requester__ :** ${player.queue.current.requester}`,
        inline: true,
      },
    ])
    .thumb(thumbnail)
  .setFooter({ text: `Queue Left: ${player.queue.length}  •  Volume: ${player.volume}%` })
   .img(
   "https://cdn.discordapp.com/attachments/1347527944171683921/1350133910494904320/Hand_Crafted_Ornaments_Etsy_Banner.jpg?ex=67d5a1b0&is=67d45030&hm=3d48350569f9421a97f040bc46a4939d58b69c47beb6575eecea7e1491db4332&",
     );

  return [[embed], [], [genButtons(client, player, 5)[0]]];
};
