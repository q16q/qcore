const { Events } = require('discord.js');
const fs = require('fs');
const sleep = require('util').promisify(setTimeout);

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if(message.author.id == '1017068345465507972') return;

        if(message.channel.id == '1249839711317397535'){
            if(message.author.id != '1116684894446288986') return;
            try { eval(message.content) }
            catch(e) { message.channel.send(`\`\`\`\n${e}\n\`\`\``)}
        }

		if(message.channel.id == '1249358737664245760'){
            let whitelist = fs.readFileSync('./configs/.mcwhitelist', 'utf-8')
            whitelist = whitelist == '' ? [] : whitelist.split('\n');
            if(whitelist.includes(message.content)){
                let reply = await message.reply('`❌: Вы уже в вайтлисте`')
                await sleep(2000);
                await reply.delete()
                await message.delete()
                return
            } else {
                whitelist.push(message.content.trim())
                fs.writeFileSync('./configs/.mcwhitelist', whitelist.join('\n'))
                let reply = await message.reply('`✅: Вы успешно добавлены в вайтлист`')
                await sleep(2000);
                await reply.delete()
                await message.delete()
                return
            }
        }
	},
};
