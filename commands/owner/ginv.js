const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ginv',
    category: 'owner',
    description: 'Generate an invite link for a server based on its ID.',
    botPerms: [],
    userPerms: [],
    usage: 'ginv <serverid>',
    owner: true,

    execute: async (client, message, args) => {
        const ownerId = "1293144836299558931";

        if (message.author.id !== ownerId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('This command is only for my owner. You cannot use this command.');
            return await message.channel.send({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('Please provide a server ID.');
            return await message.channel.send({ embeds: [embed] });
        }

        const guildId = args[0];
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('Invalid server ID. I could not find that server.');
            return await message.channel.send({ embeds: [embed] });
        }

        try {
            const textChannel = guild.channels.cache.find(c => 
                c.type === ChannelType.GuildText && 
                c.permissionsFor(client.user).has(PermissionsBitField.Flags.CreateInstantInvite)
            );

            if (!textChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('No text channels available to create an invite.');
                return await message.channel.send({ embeds: [embed] });
            }

            const invite = await textChannel.createInvite({
                unique: true,
                maxAge: 86400,
                maxUses: 1
            });

            const owner = await guild.fetchOwner();
            const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
            const boostLevels = ['None', 'Level 1', 'Level 2', 'Level 3'];
            const nsfwLevels = ['Default', 'Explicit', 'Safe', 'Age-restricted'];
            const contentFilterLevels = ['Disabled', 'Members without Roles', 'All Members'];

            const totalThreads = guild.channels.cache.filter(c => 
                c.type === ChannelType.PublicThread || 
                c.type === ChannelType.PrivateThread
            ).size;

            const totalBots = guild.members.cache.filter(member => member.user.bot).size;

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Server Info & Invite`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(
                    `**Server Name:** ${guild.name}\n` +
                    `**Server ID:** ${guild.id}\n` +
                    `**Owner:** ${owner.user.tag} (${owner.id})\n` +
                    `**Members:** ${guild.memberCount} (Humans: ${guild.memberCount - totalBots}, Bots: ${totalBots})\n` +
                    `**Roles:** ${guild.roles.cache.size}\n` +
                    `**Channels:** ${guild.channels.cache.size} (Threads: ${totalThreads})\n` +
                    `**Emojis:** ${guild.emojis.cache.size}\n` +
                    `**Stickers:** ${guild.stickers.cache.size}\n` +
                    `**Boost Level:** ${boostLevels[guild.premiumTier]} (Boosts: ${guild.premiumSubscriptionCount || 0})\n` +
                    `**Verification Level:** ${verificationLevels[guild.verificationLevel]}\n` +
                    `**Explicit Content Filter:** ${contentFilterLevels[guild.explicitContentFilter]}\n` +
                    `**NSFW Level:** ${nsfwLevels[guild.nsfwLevel]}\n` +
                    `**AFK Channel:** ${guild.afkChannel ? `${guild.afkChannel.name} (${guild.afkTimeout / 60} min)` : 'None'}\n` +
                    `**Partnered:** ${guild.partnered ? '✅ Yes' : '❌ No'}\n` +
                    `**Verified:** ${guild.verified ? '✅ Yes' : '❌ No'}\n` +
                    `**Created At:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
                )
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return await message.channel.send(`Here is the invite link: ${invite.url}`);

        } catch (error) {
            console.error('Error creating invite:', error);
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('Failed to create invite. Please try again later.');
            return await message.channel.send({ embeds: [embed] });
        }
    }
};
