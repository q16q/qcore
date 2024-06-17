const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
let whitelist = require('../../whitelist');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Управление вайтлистом (только для админов)')
        .addSubcommand(subcommand => 
            subcommand
                .setName('add')
                .setDescription('Добавление участника в вайтлист')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('ID участника')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('remove')
                .setDescription('Удаление участника из вайтлиста')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('ID участника')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dump')
                .setDescription('Дамп всех участников мемберлист')
                .addBooleanOption(option =>
                    option.setName('overwrite')
                        .setDescription('Перезапись текущего мемберлиста?')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		if(interaction.options.getSubcommand() === 'add'){
            const userId = interaction.options.getString('user');
            const current = whitelist.getWhitelist();
            current.push(userId); // test
            whitelist.writeWhitelist(current);
            await interaction.reply(`\`✅: Успешно добавлен ID ${userId} в вайтлист\``)
        } else if(interaction.options.getSubcommand() === 'remove'){
            const userId = interaction.options.getString('user');
            const current = whitelist.getWhitelist();
            if(current.includes(userId)) {
                current.splice(current.indexOf(userId), 1);
                whitelist.writeWhitelist(current);
                await interaction.reply(`\`✅: Успешно удален ID ${userId} из вайтлиста\``)
            }
            else {
                await interaction.reply(`\`❌: Невозможно удалить ID ${userId} из вайтлист\``)
            }
        } else if(interaction.options.getSubcommand() === 'dump'){
            const overwrite = interaction.options.getBoolean('overwrite');

            let members = (await (await interaction.client.guilds.fetch(require('../../config.json').guildId))
                .members.fetch())
                .toJSON();
            
            if(overwrite){
                let current = members.filter(m => !m.bot).map(m => m.id);
                whitelist.writeWhitelist(current);
                await interaction.reply(`\`✅: Успешно перезаписан вайтлист (${current.length})\``)
            } else {
                let toPush = members.filter(m => !m.bot);
                let current = whitelist.getWhitelist();
                toPush.forEach(m => !current.includes(m.id) ? current.push(m.id) : undefined);
                whitelist.writeWhitelist(current);
                await interaction.reply(`\`✅: Успешно обновлен вайтлист ${current.length}\``)
            }
        }
	},
};