 /** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { green, yellow, magenta, cyan, red, blue, gray, white } = require("colorette");
const os = require("os");

const dev = process.env.NODE_ENV !== "production";

class Logger {
  constructor() {
    this.style = dev ? yellow : blue;
  }

  /**
   * Logs messages in a structured format
   * @param {string} content - The message to log
   * @param {string} type - The log type (log, warn, error, etc.)
   * @param {string} client - The client or process name
   */
  static log(content, type = "log", client = "Process") {
    const logStyles = {
      log: { symbol: "◆━━◆", label: "🟢 LOG", labelColor: green, textColor: white },
      warn: { symbol: "⚠━━⚠", label: "⚠️ WARNING", labelColor: yellow, textColor: yellow },
      error: { symbol: "❌━━❌", label: "❌ ERROR", labelColor: red, textColor: red },
      debug: { symbol: "🐞━━🐞", label: "🐞 DEBUG", labelColor: magenta, textColor: magenta },
      cmd: { symbol: "🎮━━🎮", label: "🎮 COMMAND", labelColor: cyan, textColor: cyan },
      event: { symbol: "🔹", label: "📅 EVENT", labelColor: blue, textColor: blue },
      ready: { symbol: "🔹", label: "✅ READY", labelColor: green, textColor: green },
      database: { symbol: "🔹", label: "💾 DATABASE", labelColor: magenta, textColor: magenta },
      cluster: { symbol: "🔹", label: "🌐 CLUSTER", labelColor: white, textColor: white },
      player: { symbol: "🔹", label: "🎵 PLAYER", labelColor: cyan, textColor: cyan },
      lavalink: { symbol: "🔹", label: "🔊 LAVALINK", labelColor: yellow, textColor: yellow },
    };

    const logStyle = logStyles[type] || logStyles.log;
    client = client.length > 15 ? client.substring(0, 15) : client;

    console.log(
      `${logStyle.labelColor(logStyle.symbol)} ${gray(`[ ${client} ]`)} ⇨ ${logStyle.labelColor(`【 ${logStyle.label} 】`)} ${logStyle.textColor(content)}`
    );
  }

  /**
   * Displays system information in a structured format
   */
  static displaySystemInfo() {
    console.log(blue("=================================="));
    console.log(magenta(`Total RAM: ${Math.round(os.totalmem() / 1024 / 1024)} MB`));
    console.log(cyan(`Used RAM: ${Math.round((os.totalmem() - os.freemem()) / 1024 / 1024)} MB`));
    console.log(green(`CPU: ${os.cpus()[0].model}`));
    console.log(red(`System Uptime: ${Math.round(os.uptime() / 60)} minutes`));
    console.log(blue("=================================="));
  }
}

module.exports = Logger;
