let whitelist = require('../whitelist');

module.exports = {
    name: 'whitelist',
    async execute(client) {
        let guild = await client.guilds.fetch(require('../configs/config.env.json').guildId);
        let refreshWhitelist = async () => {
            let members = await guild.members.fetch()
            members = members.filter(m => !m.bot);
            members.each(member => {
                if(!whitelist.getWhitelist().includes(member.id)) {
                    member.ban({
                        reason: 'banned by whitelist'
                    }).catch(() => member.client.log(1, `cannot ban ${member.user.username}`, 'whitelist'));
                    member.client.log(0, `banned ${member.user.username}`, 'whitelist');
                }
            })
        };
        await refreshWhitelist();
        setInterval(refreshWhitelist, 1000 * 60 * 60 * 12)
    }
}