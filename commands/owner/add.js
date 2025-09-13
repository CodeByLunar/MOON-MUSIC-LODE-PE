/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

module.exports = {
  name: "add",
  aliases: [],
  cooldown: "",
  category: "owner",
  usage: "<mention | server_id> <bl | sbl | premium>",
  description: "Add static (blacklist user/server or give premium)",
  args: true,
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
    const id = message.mentions.users.first()?.id || args[0] || null;
    if (message.mentions?.users?.first()?.id && !args[1]) args[1] = args[0];

    let targetType = "user"; // Default target type
    let validTarget = await client.users.fetch(id).catch(() => null);

    if (!validTarget) {
      const guild = client.guilds.cache.get(id);
      if (guild) {
        targetType = "server";
        validTarget = guild;
      }
    }

    if (!validTarget) {
      return await message.reply({
        embeds: [
          new client.embed().desc(`${emoji.no} **Invalid User/Server ID provided**`),
        ],
      });
    }

    const [bl, sbl, premium] = await Promise.all([
      client.db.blacklist.get(`${client.user.id}_${id}`),
      client.db.blacklist.get(`sbl_${id}`),
      client.db.premium.get(`${client.user.id}_${id}`),
    ]);

    let static = args[1] || null;
    let db = null;
    if (static) {
      db =
        static == "bl"
          ? "blacklist"
          : static == "premium"
          ? "premium"
          : static == "sbl"
          ? "blacklist"
          : args[1];
    }

    switch (static) {
      case "bl":
      case "sbl":
      case "premium":
        if ((static === "bl" && bl) || (static === "sbl" && sbl) || (static === "premium" && premium)) {
          return await message.reply({
            embeds: [
              new client.embed().desc(
                `${emoji.no} **Operation unsuccessful**\n` +
                  `${emoji.bell} <@${id}> / \`${id}\` already has the static: \`${static}\``
              ),
            ],
          });
        }

        const key = static === "sbl" ? `sbl_${id}` : `${client.user.id}_${id}`;
        await client.db[db].set(key, true);

        await message.reply({
          embeds: [
            new client.embed().desc(
              `${emoji.yes} **Operation successful**\n` +
                `${emoji.on} Added the static \`${static}\` to <@${id}> / \`${id}\``
            ),
          ],
        });

        await client.webhooks.static
          .send({
            username: client.user.username,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [
              new client.embed()
                .desc(
                  `**Added the static:** ${static}\n` +
                    `**Moderator:** ${message.author}\n` +
                    `**Target:** ${targetType === "user" ? validTarget.tag : validTarget.name} [[${id}](https://0.0)]`
                )
                .setColor("#7ffa2d"),
            ],
          })
          .catch(() => {});
        break;

      default:
        message.reply({
          embeds: [
            new client.embed().desc(
              `${emoji.no} **No valid static provided\n**` +
                `${emoji.bell} **Available options:** \`bl\`, \`sbl\`, \`premium\``
            ),
          ],
        });
        break;
    }
  },
};