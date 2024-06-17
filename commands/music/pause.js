const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Поставить музыку на паузу'),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});
        let paused = interaction.client.vclib.currentPlayer.state.status == 'paused';
        if(paused) interaction.client.vclib.currentPlayer.unpause();
        else interaction.client.vclib.currentPlayer.pause();
        interaction.reply(`\`⏸️: Пауза: ${paused ? 'Отключено' : 'Включено'}\``).catch(() => {});
    }
}