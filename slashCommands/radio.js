/** @format
 *
 * Moon Music By PainMoon Music
 * Version: 6.0.0-beta
 * © 2024 1sT-Services
 */

const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const generate = require("@gen/radio.js");
const radio = require("@assets/radioLinks.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Choose a radio genre and start playing"),

  async execute(interaction) {
    const { channel } = interaction.member.voice;
    if (!channel) {
      return interaction.reply({
        embeds: [
          new interaction.client.embed().desc(
            `${interaction.client.emoji.no} **You must be in a voice channel to use this command!**`
          ),
        ],
        ephemeral: true,
      });
    }

    let row1 = await generate(interaction.client, "lofi_radios", "Lofi");
    let row2 = await generate(interaction.client, "hindi_radios", "Hindi");
    let row3 = await generate(interaction.client, "english_radios", "English");

    const msg = await interaction.reply({
      embeds: [
        new interaction.client.embed()
          .desc(
            `${interaction.client.emoji.radio} **Select a radio genre below**\n\n` +
              `**Available Types:**\n` +
              `${interaction.client.emoji.radio} Lofi Radio\n` +
              `${interaction.client.emoji.radio} Hindi Songs Radio\n` +
              `${interaction.client.emoji.radio} English Songs Radio\n`
          )
          .thumb(`https://cdn-icons-png.flaticon.com/512/5525/5525480.png`)
          .setFooter({ text: `Powered by Pookie` }),
      ],
      components: [row1, row2, row3],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
      idle: 30000,
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await msg
          .edit({
            embeds: [
              new interaction.client.embed().desc(
                `${interaction.client.emoji.warn} **Timeout! No radio selected**`
              ),
            ],
            components: [],
          })
          .catch(() => {});
      }
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      const query = radio[i.customId][i.values];

      const existing_player = await interaction.client.getPlayer(interaction.guild.id);
      if (existing_player) await existing_player.destroy();

      await msg
        .edit({
          embeds: [
            new interaction.client.embed().desc(
              `${interaction.client.emoji.cool} **Existing player destroyed. Preparing radio...**`
            ),
          ],
          components: [],
        })
        .catch(() => {});

      await interaction.client.sleep(1500);

      const player = await interaction.client.manager.createPlayer({
        voiceId: channel.id,
        textId: interaction.channel.id,
        guildId: interaction.guild.id,
        shardId: interaction.guild.shardId,
        loadBalancer: true,
        deaf: true,
      });

      const result = await player.search(query, {
        requester: interaction.user,
      });

      if (!result.tracks.length) {
        return await msg
          .edit({
            embeds: [
              new interaction.client.embed().desc(
                `${interaction.client.emoji.warn} **This radio is currently unavailable! \n` +
                  `${interaction.client.emoji.support} Please contact [support](${interaction.client.support}) for help**`
              ),
            ],
          })
          .catch(() => {});
      }

      const tracks = result.tracks;
      if (result.type === "PLAYLIST") {
        for (let track of tracks) await player.queue.add(track);
      } else {
        await player.queue.add(tracks[0]);
      }

      if (!player.playing && !player.paused) player.play();

      return await msg
        .edit({
          embeds: [
            new interaction.client.embed().desc(
              `${interaction.client.emoji.yes} **Started playing radio \`${i.values}\`**`
            ),
          ],
        })
        .catch(() => {})
        .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));
    });
  },
};