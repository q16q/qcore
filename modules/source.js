module.exports = {
    name: 'source',
    type: 'command',
    async execute(client, config, message, args){
        message.channel.send('`qCore by q16q`\n[📜 Source code](https://github.com/q16q/qcore)')
    }
}