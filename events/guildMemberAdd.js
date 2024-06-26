const { Events } = require('discord.js');
const whitelist = require('../whitelist');
const { guildId } = require('../configs/config.env.json')

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
        if(member.bot) return;
		if(!whitelist.getWhitelist().includes(member.id) && member.guild.id == guildId) {
            member.ban({
                reason: 'banned by whitelist'
            }).catch(() => member.client.log(1, `cannot ban ${member.user.username}`, 'whitelist'));
            member.client.log(0, `banned ${member.user.username}`, 'whitelist');
        }
	},
};
