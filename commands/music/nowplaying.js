const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Текущая музыка'),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});
        let videoInfo = interaction.client.vclib.queue[0][4]

        var mind = videoInfo.duration % (60 * 60);
        var minutes = Math.floor(mind / 60);
         
        var secd = mind % 60;
        var seconds = Math.ceil(secd);

        let embed = new EmbedBuilder()
            .addFields(
                { name: '№', value: interaction.client.vclib.queue.length + "", inline: true},
                { name: 'Длительность', value: `${minutes}:${seconds}`, inline: true },
                { name: 'Автор', value: videoInfo.author, inline: true }
            )
            .setTitle(videoInfo.name)
            .setURL(videoInfo.url)
            .setThumbnail(videoInfo.thumbnail)
            .setFooter({text: `Запрошено: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ extension: 'webp', forceStatic: true, size: 64})})
            .setTimestamp()

        interaction.reply({ embeds: [embed] }).catch(() => {});
    }
}