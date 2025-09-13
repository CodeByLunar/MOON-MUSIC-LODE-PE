/** @format */

module.exports = {
  name: "reload",
  aliases: ["rl"],
  category: "owner",
  usage: "",
  description: "Reloads all commands.",
  botPerms: [],
  userPerms: [],
  args: false,
  owner: true,

  execute: async (client, message, args) => {
    try {
      const result = await require("@reloaders/reloadCommands.js")(client);
      await message.reply({
        embeds: [new client.embed().desc(`**Commands Reloaded:** ✅ ${result}`)],
      });
    } catch (err) {
      console.error("Command reload error:", err);
      await message.reply({
        embeds: [new client.embed().desc(`**Commands Reloaded:** ❌ ${err.message}`)],
      });
    }
  },
};