/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

module.exports = {
  name: "balance",
  aliases: ["bal"],
  cooldown: "",
  category: "information",
  usage: "",
  description: "Check balance",
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
    let coins = parseInt(
      (await client.db.coins.get(`${message.author.id}`)) || 0,
    );

    const m = await message
      .reply({
        embeds: [
          new client.embed()
            .desc(
              `**<:black_moeda_:1277897366195666966> You have a total of ${
                coins || `0`
              } coins**\n\n` +
                `**Need coins ? Here's are some steps:**\n\n` +
                
                `<a:reddot_:1277566293574291530>⠀⠀**Each cmd used (1-3 coins)**\n` +
                `<a:reddot_:1277566293574291530>⠀⠀⠀**Add me in server (150 coins)**\n` +
               
                `<a:reddot_:1277566293574291530>⠀⠀⠀**Boost support server (1000 coins)**\n` +
                `<a:reddot_:1277566293574291530>⠀⠀⠀**Pay 1.5M UwU or 29.99 INR (1800 coins)**\n` +
                
                `<a:reddot_:1277566293574291530>⠀⠀⠀**Beg ! May get u rich / blacklisted**\n\n`,
            )
      .setThumbnail(client.user.displayAvatarURL())
.img(

      "https://cdn.discordapp.com/attachments/1287023669738213440/1292511725513478196/standard_1.gif?ex=6711d899&is=67108719&hm=d0a5b21d8c19606a57ca55cbcbcf6c43c97dcb6c272b3ade3742c749d15b847f&",

    )
            
        ],
      })
      .catch(() => {});
  },
};
