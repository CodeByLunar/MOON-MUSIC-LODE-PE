const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActivityType } = require("discord.js");

module.exports = async (client) => {
    try {
        const botName = client.user.username;
        const statusDelay = 8000; // 0.2 seconds

        // Status rotation queue (Bot Name → Servers → Users → Repeat)
        const statusQueue = [
            () => ({
                name: botName,
                type: ActivityType.Watching // Changed to Watching
            }),
            () => ({
                name: `${client.guilds.cache.size} Servers`,
                type: ActivityType.Watching // Changed to Watching
            }),
            () => ({
                name: `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} Users`,
                type: ActivityType.Watching // Changed to Watching
            })
        ];

        // Smooth rotation using setInterval
        const rotateStatus = () => {
            const currentStatus = statusQueue.shift();
            client.user.setPresence({
                activities: [currentStatus()],
                status: "online"
            });
            statusQueue.push(currentStatus);
        };

        // Start rotation every 0.2s
        setInterval(rotateStatus, statusDelay);

        // --- (Rest of your original code remains unchanged) ---
        let eventsSize = {};
        let commandsSize = {};
        commandsSize.slash = {};
        
        [
            eventsSize.client,
            eventsSize.node,
            eventsSize.player,
            eventsSize.custom,
            commandsSize.message,
            commandsSize.slash
        ] = await Promise.all([
            require("@loaders/clientEvents.js")(client),
            require("@loaders/nodeEvents")(client),
            require("@loaders/playerEvents")(client),
            require("@loaders/customEvents.js")(client),
            require("@loaders/commands.js")(client),
            require("@loaders/slashCommands.js")(client)
        ]);

        client.invite = {
            required: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=37080065&scope=bot`,
            admin: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`,
        };

        client.endEmbed = new EmbedBuilder()
            .setDescription(
                `All songs have been played! +play more songs to keep the party going!\n\n` +
                `<a:RED_DIAMOND:1292531280562487389> Did you know? You can enhance your music experience! ` +
                `Unlock even more cool features & support us by purchasing our [premium](https://discord.gg/cnnZnc6QyS). Happy listening!`
            )
            .setFooter({ text: "Powered by Team Pookie" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Support")
                .setStyle(ButtonStyle.Link)
                .setURL(client.support),
            new ButtonBuilder()
                .setLabel("Add Me")
                .setStyle(ButtonStyle.Link)
                .setURL(client.invite.admin)
        );

        client.log(
            `Loaded Events: Client(${eventsSize.client}) Node(${eventsSize.node}) Player(${eventsSize.player}) Custom(${eventsSize.custom})`,
            "event"
        );
        
        client.log(
            `Loaded Commands: Message(${commandsSize.message}) Slash(${commandsSize.slash})`,
            "cmd"
        );
        
        client.log(
            `✅ ${botName} is now online with Watching status rotation!`,
            "ready"
        );

    } catch (error) {
        console.error("❌ Error in ready event:", error);
    }
};