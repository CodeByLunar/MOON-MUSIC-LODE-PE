/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { readdirSync } = require("fs");

module.exports = async (client) => {
  let count = 0;

  // Read all files inside the custom events folder
  const eventFiles = readdirSync("./events/custom").filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const event = require(`${process.cwd()}/events/custom/${file}`);

      // Validate event structure
      if (!event.name || typeof event.run !== "function") {
        console.warn(`[WARNING] Skipping event: ${file} → Missing 'name' or 'run' function.`);
        continue; // Skip this file
      }

      // Register event listener
      client.on(event.name, (...args) => event.run(client, ...args));
      count++;

      console.log(`[✅] Loaded event: ${event.name} (${file})`);
    } catch (error) {
      console.error(`[❌] Failed to load event: ${file}\n`, error);
    }
  }

  return count;
};
