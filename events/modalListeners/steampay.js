const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const { steamPayChoices } = require('../../configs/config.env.json');

module.exports = {
    name: 'steampay',
    type: 'modalListener',
    async execute(interaction) {
        let data = {}
        interaction.fields.fields.each(f => {
            if(f.customId == 'username') data.username = f.value
            if(f.customId.startsWith('amount')) {
                data.amount = Number(f.value)
                data.method = Number(f.customId.split('amount_method')[1])
            }
        })

        let msg = await interaction.reply({ content: '`💤 Проверяю логин...`', ephemeral: true })
        let response = await axios.post('https://ue.bot/api/webstore/steam/login', {
            login: data.username
        }).catch(async () => {
            await msg.edit({ content: '`❌ Что-то пошло не так!`', ephemeral: true })
            return
        })

        if(!response.data.status) {
            await msg.edit({ content: '`❌ Неверный логин`', ephemeral: true })
            return
        }

        let methodType = 0;
        let type = 0;
        switch(data.method){
            case 0:
                methodType = 2;
                type = 8;
                break;
            case 1:
                methodType = 0;
                type = 3;
                break;
            case 2:
                methodType = 0;
                type = 9;
                break;
            case 3:
                methodType = 3;
                type = 0;
                break;
        }

        let getPercent = (n, p) => n * (p / 100)

        let serviceFee = getPercent(data.amount, 13)
        let bankFee = getPercent(data.amount, 3)
        let payFee = getPercent(serviceFee + bankFee + data.amount, 8)

        let total = serviceFee + bankFee + payFee + data.amount

        let embed = new EmbedBuilder()
            .setTitle('Пополнение Steam')
            .addFields(
                { name: 'Логин Steam', value: '`' + data.username + '`', inline: true },
                { name: 'Сумма', value: `\`${data.amount}₽\``, inline: true },
                { name: 'Метод оплаты', value: '`' +steamPayChoices[data.method] + '`', inline: true },
                { name: 'К оплате', value: `\`${total}₽\``, inline: false}
            )
            .setFooter({ text: 'Запрос отменится через 60 секунд' })
            .setTimestamp()
        
        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Все верно')
                    .setCustomId('confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel('Отменить')
                    .setCustomId('cancel')
                    .setStyle(ButtonStyle.Danger)
            )

        await msg.edit({
            embeds: [embed],
            components: [row],
            content: '`⬇️ Пожалуйста, проверьте информацию снизу`'
        })
        
        msg = await interaction.fetchReply()

        let filter = i => ['confirm', 'cancel'].includes(i.customId)
        let collector = await msg.createMessageComponentCollector({
            filter,
            time: 60000
        })

        collector.on('collect', async i => {
            if(i.customId == 'cancel') {
                await interaction.editReply({ content: '`❌ Отменено`', components: [], embeds: [] })
            }
            if(i.customId == 'confirm') {
                await interaction.editReply({ content: '`💤 Создаю заказ...`', components: [] })
                let response = await axios.post('https://ue.bot/api/webstore/steam/order', {
                    amount: data.amount,
                    amountCurrency: data.amount,
                    currency: 'RUB',
                    login: data.username,
                    methodType: methodType,
                    type: type
                }).catch(async () => {
                    await interaction.editReply({ content: '`❌ Что-то пошло не так!`', embeds: [], ephemeral: true })
                    return
                })

                if(response.data.status) {
                    let row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel(`${steamPayChoices[data.method]}`)
                                .setURL(encodeURI(response.data.url))
                                .setStyle(ButtonStyle.Link)
                        )
                    
                    embed.setFooter({ text: `ID заказа #${response.data.id}`})
                    await interaction.editReply({ content: '`⬇️ Создана ссылка для оплаты, начинаю слушать транзацию`', components: [row], embeds: [embed] })
                    
                    let intervalData = { foundPayment: false, completed: false }
                    let listenInterval = setInterval(async () => {
                        let response1 = await axios.get(`https://ue.bot/api/webstore/steam/order?id=${response.data.id}`)
                            .catch(() => {})
                        
                        if(response1.data.status) {
                            if(response1.data.message == 'wait-order' && !intervalData.foundPayment) {
                                intervalData.foundPayment = true
                                embed.setFooter({ text: `ID заказа #${response1.data.orderId}` })
                                await interaction.editReply({ content: '`💤 Оплата найдена, ждем выполнения заказа`', components: [], embeds: [embed] })
                            }
                            if(response1.data.message == 'order-completed' && !intervalData.completed) {
                                intervalData.completed = true
                                await interaction.editReply({ content: '`✅ Заказ завершен`', components: [], embeds: [] })
                                clearInterval(listenInterval)
                            }
                        }
                    }, 5000)
                }
            }
        })
    }
}