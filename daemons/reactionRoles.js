const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType, EmbedBuilder } = require('discord.js');
let config = require('../configs/reactroles.config.env');
const { StringSelectMenuOptionBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'reactionRoles',
    async execute(client) {
        let channel = await client.channels.fetch(config.reactionRolesChannel);
        let messages = await channel.messages.fetch();
        let rewrite = messages.first() ? messages.first().content == 'rewrite' : true;
        if(rewrite) {
            messages.each(message => message.delete())
        }
        if(messages.size == 0 || rewrite) {
            for(category of config.categories) {
                let selectMenus = []
                let options = []
                category.roles.forEach((n, i) =>{
                    let item = new StringSelectMenuOptionBuilder()
                            .setLabel(n.name)
                            .setValue(n.id)
                    n.color != 'none' ? item.setEmoji({
                        name: `color${i}`,
                        id: n.color
                    }) : undefined
                    options.push(
                        item
                    )
                })
                selectMenus.push(
                    new StringSelectMenuBuilder()
                        .setCustomId(category.customId)
                        .addOptions(options)
                        .setMaxValues(category.multiple ? category.roles.length : 1)
                        .setMinValues(category.multiple ? 0 : 0)
                        .setPlaceholder('Выберите роль')
                )
            
                let row = new ActionRowBuilder()
                    .addComponents(selectMenus)
                

                await channel.send({components: [row], content: `# ${category.name}`}).catch(e => console.log(e.rawError.errors.components[0].components[1]))
            }
        }
        let collector = channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect
        })
        collector.on('collect', async i => {
            let roles = i.values;
            let member = i.member;
            
            let guildRoles = await i.guild.roles.fetch();
            let reactRoles = guildRoles.filter(r => config.categories.filter(c => c.customId == i.customId).map(c => c.roles.map(cr => cr.id)).flat().includes(r.id));
            let memberReactRoles = reactRoles.filter(r => r.members.find(m => m.id == member.id));

            memberReactRoles.forEach(r => member.roles.remove(r.id));
            roles.forEach(r => member.roles.add(r));
            await i.deferUpdate();
        })
    }
}