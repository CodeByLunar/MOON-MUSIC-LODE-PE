module.exports = async (message, premiumUser, coinRateLimitManager, client = message.client) => {
  const coinBucket = coinRateLimitManager.acquire(`${message.author.id}`);

  if (!coinBucket.limited || premiumUser) {
    let coins = parseInt((await client.db.coins.get(`${message.author.id}`)) || 0);
    let total = coins + parseInt(Math.floor(Math.random() * (2 + 1)) + 1);
    await client.db.coins.set(`${message.author.id}`, total);
  }

  try {
    coinBucket.consume();
  } catch (e) {}

  // ✅ Update Command Count
  let commandCount = parseInt((await client.db.cmdCount.get(`${message.author.id}`)) || 0);
  await client.db.cmdCount.set(`${message.author.id}`, commandCount + 1);

  // 📌 Webhook Logging (Simple & Effective)
  await client.webhooks.command
    .send({
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
      embeds: [
        new client.embed()
          .setColor("#0099ff")
          .setTitle("📜 Command Executed")
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `**User:** ${message.author.tag} (${message.author.id})\n` +
            `**Guild:** ${message.guild.name} (${message.guild.id})\n` +
            `**Channel:** ${message.channel.name} (${message.channel.id})\n\n` +
            `**Message Content:**\n\`\`\`\n${message.content}\n\`\`\`\n\n` +
            `**Coins Earned:** ${premiumUser ? "Premium Bonus" : "Normal"}\n` +
            `**Total Commands Used:** ${commandCount + 1}`
          )
          .setFooter({ text: "Command Logging System", iconURL: client.user.displayAvatarURL() }),
      ],
    })
    .catch(() => {});
};
