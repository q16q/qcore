const { Client, IntentsBitField } = require('discord.js');
const { readdirSync } = require('fs');
require('dotenv').config();

let prefix = '>'
let config = { modules: [] }
let client = new Client({
    intents: new IntentsBitField(3276799)
})

let loadModules = () => {
    for(i of readdirSync('modules')) {
        console.log(`Loading module: ${i}`)
        var module = require(`./modules/${i}`)
        config.modules.push(module)
        
        // run daemons
        config.modules.filter(m => m.type == 'daemon').forEach(m => m.execute(client, config))
    }
}

client.login(process.env.TOKEN)

client.on('ready', () => {
    console.log('Loading modules...')
    loadModules()
    console.log(`Ready, logged in as ${client.user.tag}`)
})

client.on('messageCreate', message => {
    if(!message.content.startsWith(prefix)) return;
    let args = message.content.slice(prefix.length).split(" ")
    let command = args.shift()
    config.modules.filter(m => m.name.toLowerCase() == command.toLowerCase() && m.type == 'command').forEach(async m => await m.execute(client, config, message, args))
})