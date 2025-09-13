/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

module.exports = {
  name: "mention",
  run: async (client, message) => {
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////// Reply when bot is mentioned ////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    const embed = new client.embed()
      .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()}) .thumb(client.user.displayAvatarURL())
      .setTitle(`**<:info:1278337742765293620>__Pookie Music!__**`)
      
      .setDescription(`\`Hey ${message.author.username}, My Prefix For this Server is \`${client.prefix}\`\n${client. prefix}help to get a list of Commands\``)
      
      .setFooter({
        text: `By Team Pookie`,
      })
      .setTimestamp();
    await message.reply({ embeds: [embed] }).catch(() => {});
  },
};
