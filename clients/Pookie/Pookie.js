/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const YML = require("js-yaml").load(
  require("fs").readFileSync("./config.yml", "utf8"),
);
const bot = require("../../main/extendedClient");

const client = new bot();
require("@utils/antiCrash")(client);
client.connect(
  YML.Moon Music.TOKEN,
  YML.Moon Music.PREFIX,
  YML.Moon Music.EMOJIS,
  YML.Moon Music.COLOR,
  YML.Moon Music.TOPGGAUTH,
  YML.Moon Music.VOTEURI,
  YML.Moon Music.MONGO
);
module.exports = client;

