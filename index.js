const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: require('./configs/intents.config.env.js') });
const config = require('./configs/config.env.json');
require('./logger').patch(client, config.loggerLevel);

// command handling

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		if(file == 'category.js') continue;
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			client.log(1, `the command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// event handling

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.TOKEN);