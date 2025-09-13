const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (client, player, number = 5) => {
  const isPaused = player.shoukaku.paused;
  const playPauseEmoji = isPaused ? '<:Play:1334836727113842698>' : '<:resume:1346684886236528692>';
  const autoplayStyle = player.data.get("autoplay") ? ButtonStyle.Success : ButtonStyle.Secondary;

  const row = new ActionRowBuilder();

  const previousButton = new ButtonBuilder()
    .setCustomId(`${player.guildId}previous`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('<:previous:1346686491237290075>');

  const playPauseButton = new ButtonBuilder()
    .setCustomId(`${player.guildId}play_pause`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(playPauseEmoji);

  const skipButton = new ButtonBuilder()
    .setCustomId(`${player.guildId}skip`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('<:skip:1346686506324066375>');

  const autoplayButton = new ButtonBuilder()
    .setCustomId(`${player.guildId}autoplay`)
    .setStyle(autoplayStyle)
    .setEmoji('<:Autoplay:1346685337493180478>');

  const stopButton = new ButtonBuilder()
    .setCustomId(`${player.guildId}stop`)
    .setStyle(ButtonStyle.Danger)
    .setEmoji('<:stop:1346685412466495488>');

  switch (number) {
    case 5:
      row.addComponents(previousButton, playPauseButton, skipButton, autoplayButton, stopButton);
      break;
    case 4:
      row.addComponents(previousButton, playPauseButton, skipButton, stopButton);
      break;
    case 3:
      row.addComponents(playPauseButton, skipButton, stopButton);
      break;
  }

  return [row];
};
