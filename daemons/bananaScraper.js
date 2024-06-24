const axios = require('axios');
const { bananaChannel, bananaMessage } = require('../configs/config.env.json');

module.exports = {
    name: 'bananaScraper',
    async execute(client) {
        let scrapeBananas = async () => {
            let baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=2923300&currency=5&market_hash_name='
            let bananas = ['Biosnana', 'Blackholenana', 'Hacked%20Banana', 'Shinobinana', 'Disconana', 'Ultranana']
            let bananasResult = []
            let mainChannel = await client.channels.fetch(bananaChannel)

            for(let banana of bananas) {
                let response = await axios({
                    method: 'get',
                    url: baseUrl + banana,
                    validateStatus: () => true
                })
                response = response.data
                try {
                    bananasResult.push(banana.replace('%20', ' ') + ' : ' + response.lowest_price)
                } catch(err) {}
            }

            let result = '```\n' + bananasResult.join('\n') + '\n```';
            let message = await mainChannel.messages.fetch(bananaMessage);
            message.edit(result)
        }
        scrapeBananas()
        setInterval(scrapeBananas, 1000 * 60  * 60)
    }
}