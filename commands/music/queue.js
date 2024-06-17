const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Показать очередь'),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {});
        if(!interaction.client.vclib.currentPlayer) return interaction.reply('`❌: Плеер не инициализирован!`').catch(() => {});
        if(!['playing', 'paused'].includes(interaction.client.vclib.currentPlayer.state.status)) return interaction.reply('`❌: Музыка не играет!`').catch(() => {});
        
        let queue = interaction.client.vclib.queue;
        if(interaction.client.vclib.lQueue.length > 0) queue = interaction.client.vclib.lQueue;

        let queueString = interaction.client.pagelib.renderQueueString(queue, 0);
        let pages = interaction.client.pagelib.getMaxPages(queue);

        let embed = new EmbedBuilder()
            .setTitle('Очередь')
            .setDescription(queueString)
            .setFooter({ text: `В очереди: ${queue.length} | Страница: 1/${pages}` })
            .setTimestamp();
        
        let page = 0;
        
        let back = new ButtonBuilder()
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
            .setCustomId(`back${page}`);

        let next = new ButtonBuilder()
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pages == 1 ? true : false)
            .setCustomId(`next${page}`);
        
        let row = new ActionRowBuilder()
            .addComponents(back, next);

        let response = await interaction.reply({ embeds: [embed], components: [row] }).catch(() => {});
        let pageCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        pageCollector.on('collect', async i => {
            if(i.user.id !== interaction.user.id) return i.reply({ content: '❌: Вы не можете использовать эту кнопку!', ephemeral: true }).catch(() => {});

            if(i.customId.startsWith('back')) {
                if(interaction.client.vclib.lQueue.length > 0) queue = interaction.client.vclib.lQueue;
                let prevPage = Number(i.customId.split('back')[1]);
                pages = interaction.client.pagelib.getMaxPages(queue);
                let currentPage = prevPage == 0 ? 0 : prevPage - 1;
                if(currentPage == 0) back.setDisabled(true);
                else back.setDisabled(false);
                if(currentPage == pages - 1) next.setDisabled(true);
                else next.setDisabled(false);
                queueString = interaction.client.pagelib.renderQueueString(queue, currentPage);
                next.setCustomId(`next${currentPage}`); back.setCustomId(`back${currentPage}`);
                embed.setDescription(queueString).setFooter({ text: `В очереди: ${queue.length} | Страница: ${currentPage+1}/${pages}` });
                let row = new ActionRowBuilder()
                    .addComponents(back, next);
                await i.update({ embeds: [embed], components: [row] }).catch(() => {});
            } else if(i.customId.startsWith('next')) {
                if(interaction.client.vclib.lQueue.length > 0) queue = interaction.client.vclib.lQueue;
                let prevPage = Number(i.customId.split('next')[1]);
                pages = interaction.client.pagelib.getMaxPages(queue);
                let currentPage = prevPage + 1 == pages ? pages : prevPage + 1;
                if(currentPage == 0) back.setDisabled(true);
                else back.setDisabled(false);
                if(currentPage == pages - 1) next.setDisabled(true);
                else next.setDisabled(false);
                queueString = interaction.client.pagelib.renderQueueString(queue, currentPage);
                next.setCustomId(`next${currentPage}`); back.setCustomId(`back${currentPage}`);
                embed.setDescription(queueString).setFooter({ text: `В очереди: ${queue.length} | Страница: ${currentPage+1}/${pages}` });
                let row = new ActionRowBuilder()
                    .addComponents(back, next);
                await i.update({ embeds: [embed], components: [row] }).catch(() => {});
            }
        });
    }
}