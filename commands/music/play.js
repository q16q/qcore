const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Проиграть трек')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Название или URL')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('playlist')
                .setDescription('Искать плейлисты (YouTube)')
                .setRequired(false)),
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply('`❌: Вы не в голосовом канале!`').catch(() => {})
        interaction.client.soundlib.playSound('buffering', interaction.member.voice.channel)
        const query = interaction.options.getString('query');
        const playlist = interaction.options.getBoolean('playlist');
        if(query.includes('soundcloud.com') && query.includes('/likes'))
            return await interaction.reply('`❌: Лайки SoundCloud пока не поддерживаются!`').catch(() => {});
        if(client.vclib.soundcloudDisabled) return await interaction.reply('`❌: SoundCloud заблокирован в России!`').catch(() => {});
        let reply = await interaction.reply('`🔄️: Прогружаю треки...`').catch(() => {});

        let vc = interaction.member.voice.channel;
        let type = await interaction.client.vclib.validate(query);
        let info = null
        if(type != 'search') {
            let tmpInfo = await interaction.client.vclib.getInfo(query, type)
            tmpInfo = await interaction.client.vclib.parseRawInfo(tmpInfo)
            if(tmpInfo.playlist) await reply.edit({ content: `\`🔄️: Прогружаю ${tmpInfo.tracks.length} треков...\`` })
            info = await interaction.client.vclib.play({
                mode: 'url',
                type: type,
                channel: vc,
                url: query
            })
        } else {
            info = await interaction.client.vclib.play({
                mode: 'search',
                channel: vc,
                query: query,
                type: playlist ? 'yt_playlist' : 'yt_video'
            })
        }

        if(!info.playlist) {
            var mind = info.duration % (60 * 60);
            var minutes = Math.floor(mind / 60);
         
            var secd = mind % 60;
            var seconds = Math.ceil(secd);

            let embed = new EmbedBuilder()
                .setTitle(`${info.name}`)
                .setFooter({text: `Запрошено: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ extension: 'webp', forceStatic: true, size: 64})})
                .setURL(info.url)
                .setThumbnail(info.thumbnail)
                .setTimestamp()
                .addFields(
                    { name: '№', value: interaction.client.vclib.queue.length + "", inline: true},
                    { name: 'Длительность', value: `${minutes}:${seconds}`, inline: true },
                    { name: 'Автор', value: `${info.author}`, inline: true }
                )

            await reply.edit({ embeds: [embed], content: '_ _' }).catch(() => {});
        } else {
            var hours = Math.floor(info.totalDuration / (60 * 60));

            var divisor_for_minutes = info.totalDuration % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
        
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            
            let totalDuration = `${hours}:${minutes}:${seconds}`
            let embed = new EmbedBuilder()
                .setTitle(`${info.name}`)
                .setFooter({text: `Запрошено: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ extension: 'webp', forceStatic: true, size: 64})})
                .setURL(info.url)
                .setThumbnail(info.thumbnail)
                .setTimestamp()
                .addFields(
                    { name: '№', value: interaction.client.vclib.queue.length + "", inline: true},
                    { name: 'Кол-во треков', value: info.tracks.length + "", inline: true },
                    { name: 'Автор', value: `${info.author}`, inline: true },
                    { name: 'Длительность', value: `${totalDuration}`, inline: true }
                )

            await reply.edit({ embeds: [embed], content: '_ _' }).catch(() => {});
        }
        interaction.client.soundlib.playSound('startplaying', interaction.member.voice.channel);
    }
}