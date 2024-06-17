const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Зациклить трек')
        .addBooleanOption(option => option
            .setName('queue')
            .setDescription('Зациклить очередь')
            .setRequired(false)),
    async execute(interaction) {
        let queue = interaction.options.getBoolean('queue');
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});        
        if(!queue){
            let looped = interaction.client.vclib.loopCurrent;
            !looped ? interaction.client.vclib.loopQueueToggle(false) : undefined
            interaction.client.vclib.loopCurrent = !looped;
            interaction.reply(`\`🔂: Цикл трека: ${looped ? 'Отключено' : 'Включено'}\``).catch(() => {});
            if(looped) interaction.client.soundlib.playSound('unloop', interaction.member.voice.channel)
            else interaction.client.soundlib.playSound('loopcurrent', interaction.member.voice.channel)
        } else {
            interaction.client.vclib.loopQueue = !interaction.client.vclib.loopQueue;
            let looped = interaction.client.vclib.loopQueue;
            if(looped) {
                interaction.client.vclib.loopCurrent = false;
                interaction.client.vclib.loopQueueToggle(true);
                interaction.reply(`\`🔂: Цикл очереди: ${looped ? 'Включено' : 'Отключено'}\``).catch(() => {});
                interaction.client.soundlib.playSound('loopqueue', interaction.member.voice.channel)
            } else {
                interaction.client.vclib.loopQueueToggle(false);
                interaction.reply(`\`🔂: Цикл очереди: ${looped ? 'Включено' : 'Отключено'}\``).catch(() => {});
                interaction.client.soundlib.playSound('unloop', interaction.member.voice.channel)
            }
        }
    }
}