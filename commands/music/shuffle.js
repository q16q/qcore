const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Перемешать очередь'),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        shuffleArray(interaction.client.vclib.queue);
        if(interaction.client.vclib.loopCurrent) interaction.client.vclib.loopCurrent = false;
        if(interaction.client.vclib.loopQueue) shuffleArray(interaction.client.vclib.lQueue);
        interaction.client.soundlib.playSound('shuffle', interaction.member.voice.channel)
        interaction.reply('`🔀: Перемешано`').catch(() => {});
    }
}