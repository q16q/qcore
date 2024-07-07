const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steampay')
        .setDescription('Пополнение кошелька Steam через сервис ue.bot')
        .addStringOption(option => option
            .addChoices({
                    name: 'FreeKassa (Карты РФ) 10%',
                    value: '0'
                }, {
                    name: 'PayPalych (СБП) до 8%',
                    value: '1'
                }, {
                    name: 'FreeKassa (СБП) 9.1%',
                    value: '2'
                }, {
                    name: 'AnyPay (Криптовалюта) 8%',
                    value: '3'
                })
            .setName('method')
            .setRequired(true)
            .setDescription('Метод оплаты')
        ),
    async execute(interaction) {
        let method = Number(interaction.options.getString('method'))
        let modal = new ModalBuilder()
            .setCustomId('steampay')
            .setTitle('Данные для пополнения')
        
        let usernameRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('username')
                    .setLabel('Логин Steam')
                    .setStyle(TextInputStyle.Short)
            )
        
        let amountRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(`amount_method${method}`)
                    .setLabel('Сумма пополнения (руб.)')
                    .setStyle(TextInputStyle.Short)
            )
        
        modal.addComponents(usernameRow, amountRow)
        await interaction.showModal(modal)
    }
}