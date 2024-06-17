const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Пропустить трек'),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});
        interaction.client.vclib.loopCurrent = false;
        interaction.client.vclib.currentPlayer.stop();
        interaction.reply('`⏭️: Пропущено`').catch(() => {});
        interaction.client.soundlib.playSound('skipsong', interaction.member.voice.channel)
    }
}