const { Events, Collection } = require('discord.js');
const path = require('node:path');
const fs = require('fs');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.log(`Ready! Logged in as ${client.user.tag}`);
		// daemon handling

		client.daemons = new Collection();
		const daemonsPath = path.join(path.join(__dirname, '..'), 'daemons');
		const daemonFiles = fs.readdirSync(daemonsPath).filter(file => file.endsWith('.js'));

		for (const file of daemonFiles) {
			const filePath = path.join(daemonsPath, file);
			const daemon = require(filePath);
			if ('name' in daemon && 'execute' in daemon) {
				client.daemons.set(daemon.name, daemon);
			} else {
				console.log(1, `the daemon at ${filePath} is missing a required "name" or "execute" property.`)
			}
		}

		client.daemons.each(async daemon => await daemon.execute(client));
	},
};
