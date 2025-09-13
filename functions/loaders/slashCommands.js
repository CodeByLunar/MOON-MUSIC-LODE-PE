/**
 * DEVU WAS HERE
 * MADE BY DEVU SADE CREDITS HAYE TOH TERI MA KO NAMAN :D
 * FEUGO KI MA CHOD DUNGA 🥰💗👅
 */

const { REST, Routes } = require("discord.js");
const { readdirSync, readFileSync } = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs");
const Logger = require("../../plugins/logger");

const config = yaml.load(readFileSync(path.join(__dirname, "../../config.yml"), "utf8"));

const clientId = config.Moon Music.CLIENT_ID;
const token = config.Moon Music.TOKEN;

module.exports = async (client) => {
    if (!client.slashCommands) client.slashCommands = new Map(); 

    let count = 0;
    const commands = [];
    const foldersPath = path.join(__dirname, "../../slashCommands");
    const commandFoldersOrFiles = readdirSync(foldersPath);

    for (const item of commandFoldersOrFiles) {
        const itemPath = path.join(foldersPath, item);
        if (fs.lstatSync(itemPath).isDirectory()) {
            const commandFiles = readdirSync(itemPath).filter((file) => file.endsWith(".js"));
            for (const file of commandFiles) {
                count++;
                const filePath = path.join(itemPath, file);
                const command = require(filePath);
                if ("data" in command && "execute" in command) {
                    commands.push(command.data.toJSON());
                    client.slashCommands.set(command.data.name, command);
                    Logger.log(`Loaded slash command: ${command.data.name}`, "cmd");
                } else {
                    Logger.log(`The command at ${filePath} is missing "data" or "execute" property.`, "warn");
                }
            }
        } else if (item.endsWith(".js")) {
            count++;
            const command = require(itemPath);
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
                client.slashCommands.set(command.data.name, command);
                Logger.log(`Loaded slash command: ${command.data.name}`, "cmd");
            } else {
                Logger.log(`The command at ${itemPath} is missing "data" or "execute" property.`, "warn");
            }
        }
    }

    const rest = new REST().setToken(token);

    (async () => {
        try {
            Logger.log(`Started refreshing ${commands.length} application (/) commands.`, "log");
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            Logger.log(`Successfully reloaded ${data.length} application (/) commands.`, "ready");
        } catch (error) {
            Logger.log(`Error reloading commands: ${error.message}`, "error");
        }
    })();

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            Logger.log(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`, "cmd");
            await command.execute(interaction);
        } catch (error) {
            Logger.log(`Error executing command ${interaction.commandName}: ${error.message}`, "error");
            await interaction.reply({
                content: "There was an error executing this command!",
                ephemeral: true,
            });
        }
    });

    return count;
};
