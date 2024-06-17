const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mcstatus = require('@hardxploit/mc-status');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcutil')
        .setDescription('Утилита для просмотра Minecraft серверов')
        .addSubcommand(subcommand => 
            subcommand
                .setName('lookup')
                .setDescription('Поиск сервера')
                .addStringOption(option =>
                    option.setName('server')
                        .setDescription('IP сервера')
                        .setRequired(true))),
    async execute(interaction) {
        if(interaction.options.getSubcommand() === 'lookup'){
            const server = interaction.options.getString('server');
            let status = new mcstatus.JavaStatus(server);

            status = await status.get();
            let embed = new EmbedBuilder()
                .setTitle('Информация о сервере')
                .addFields(
                    { name: 'IP', value: `${status.host}`, inline: true },
                    { name: 'Порт', value: `${status.port}`, inline: true },
                    { name: 'Версия', value: `${status.version.name_clean}`, inline: true },
                    { name: 'Статус', value: status.online ? 'Онлайн' : 'Оффлайн', inline: true },
                    { name: 'Онлайн игроков', value: `${status.players.online}`, inline: true },
                    { name: 'Максимум игроков', value: `${status.players.max}`, inline: true },
                    { name: 'Модификация', value: status.software ? status.software : 'Нет', inline: true },
                )
            
            await interaction.reply({ embeds: [embed] });
        }
    }
}