/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Enable or disable autoplay"),

  async execute(interaction) {
    let player = await interaction.client.getPlayer(interaction.guild.id);

    let data = player.data.get("autoplay");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enable")
        .setLabel("Enable")
        .setStyle(ButtonStyle.Success)
        .setDisabled(data ? true : false),
      new ButtonBuilder()
        .setCustomId("disable")
        .setLabel("Disable")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(data ? false : true)
    );

    const m = await interaction.reply({
      embeds: [
        new interaction.client.embed().desc(
          `<:autoplay:1277594426977554544> **Choose autoplay-mode :**`
        ),
      ],
      components: [row],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = m.createMessageComponentCollector({
      filter,
      time: 60000,
      idle: 30000 / 2,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (!buttonInteraction.deferred) await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === "enable") {
        player.data.set("autoplay", true);
        let emb = new interaction.client.embed().desc(
          `<:nenable:1277575439392440422> **Autoplay is now \`Enabled\`**\n` +
            `<a:notify:1277591983443153021> *Set by ${interaction.user.tag} - (New config)*`
        );
        await require("@functions/updateEmbed.js")(interaction.client, player);
        return await m.edit({ embeds: [emb], components: [] });
      }

      player.data.set("autoplay", false);
      let emb = new interaction.client.embed().desc(
        `<:ndisable:1277575437610123378> **Autoplay is now \`Disabled\`**\n` +
          `<a:notify:1277591983443153021> *Set by ${interaction.user.tag} - (New config)*`
      );
      await require("@functions/updateEmbed.js")(interaction.client, player);
      return await m.edit({ embeds: [emb], components: [] });
    });

    collector.on("end", async (collected, reason) => {
      if (collected.size === 0) {
        await m.edit({
          embeds: [
            new interaction.client.embed().desc(
              `<a:status_yellow:1331400737913307241>} **Timed out! Falling back to existing profile**`
            ),
          ],
          components: [],
        });

        player = await interaction.client.getPlayer(interaction.guild.id);
        setTimeout(async () => {
          await m.edit({
            embeds: [
              new interaction.client.embed().desc(
                `${player?.data.get("autoplay")
                  ? `<:nenable:1277575439392440422> **Autoplay set to \`Enabled\`**\n<a:notify:1277591983443153021> *Timed out! Fell back to existing config*`
                  : `<:ndisable:1277575437610123378> **Autoplay set to \`Disabled\`**\n<a:notify:1277591983443153021> *Timed out! Fell back to existing config*`
                }`
              ),
            ],
            components: [],
          });
        }, 2000);
      }
    });
  },
};

