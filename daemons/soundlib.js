const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
    name: 'soundlib',
    async execute(client) {
        client.soundlib = {};
        client.soundplayer = createAudioPlayer();
        client.soundlib.sndplayerSubscribed = []

        client.soundlib.playSound = (sound, channel) => {
            if(!sound) return;
            let connection = client.vclib.getConnection(channel)
            let resource = createAudioResource(`./sounds/${sound}.wav`);
            if(!client.soundlib.sndplayerSubscribed.includes(channel.id))
                connection.subscribe(client.soundplayer);
            client.soundlib.sndplayerSubscribed.push(channel.id);
            client.soundplayer.stop();
            client.soundplayer.play(resource);
        }
        client.log(0, 'loaded sound library', 'soundlib')
    }
}