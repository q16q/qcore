const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isModalSubmit()) {
			fs.readdirSync('./events/modalListeners').filter(f => f.endsWith('.js')).forEach(async file => {
				let module = require(`./modalListeners/${file}`);
				if(module.name == interaction.customId) await module.execute(interaction);
			})
		}
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '`❌: Произошла ошибка при выполнении этой команды!`', ephemeral: true }).catch(() => {});
			} else {
				await interaction.reply({ content: '`❌: Произошла ошибка при выполнении этой команды!`', ephemeral: true }).catch(() => {});
			}
		}
	},
};
