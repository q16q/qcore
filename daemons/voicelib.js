const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
require('dotenv').config({ path: '../.env' })
const play = require('play-dl');
const ytdl = require('ytdl-core');

module.exports = {
    name: 'voicelib',
    async execute(client) {
        client.vclib = {};
        client.vclib.queue = [];
        client.vclib.lQueue = [];
        client.vclib.loopQueue = false;
        client.vclib.loopCurrent = false;
        client.vclib.currentConnection = null;
        client.vclib.shuffled = false;
        client.vclib.beforeShuffle = null;
        play.setToken({ soundcloud: { client_id: (await play.getFreeClientID()) } })
        
        client.log(0, 'loaded google api key', 'voicelib')

        client.vclib.getConnection = (channel) => {
            if(!channel) return;
            if(!client.vclib.currentConnection) {
            let connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            client.vclib.currentConnection = connection;
            return connection; }
            else return client.vclib.currentConnection;
        }

        client.vclib.playQueue = async () => {
            let video = client.vclib.queue[0];
            let channel = video[0];
            if(video[4].fromPlaylist) {
                let stream = await client.vclib.getAudioStream(video[4].url)
                if(video[4].youtube) video[1] = createAudioResource(stream)
                else video[1] = createAudioResource(stream.stream, {
                    inputType: stream.type
                })
            }
            let resource = video[1];
            let connection = client.vclib.getConnection(channel);
            if(!client.vclib.currentPlayer) { client.vclib.currentPlayer = createAudioPlayer();
            connection.subscribe(client.vclib.currentPlayer); }
            client.vclib.currentPlayer.play(resource);
            client.vclib.currentPlayer.on('idle', async () => {
                let nextResource = await client.vclib.getNextResource();
                if(nextResource) client.vclib.currentPlayer.play(nextResource); 
            });
        }

        client.vclib.getNextResource = async () => {
            if(client.vclib.lQueue.length > 0 && client.vclib.queue.length < 1) {
                for(r of client.vclib.lQueue) client.vclib.queue.push(r)
            }
            if(client.vclib.queue.length < 1) return;
            let video = client.vclib.queue[0];
            if(!client.vclib.loopCurrent && !client.vclib.loopQueue){
                if(!client.vclib.shuffled) client.vclib.queue.shift()
                else { client.vclib.shuffled = false; client.vclib.beforeShuffle = null }
                video = client.vclib.queue[0];
                if (client.vclib.queue.length < 1) return;
                if(video[4].fromPlaylist) {
                    let stream = await client.vclib.getAudioStream(video[4].url)
                    if(video[4].youtube) video[1] = createAudioResource(stream)
                    else video[1] = createAudioResource(stream.stream, {
                        inputType: stream.type
                    })
                }
                return video[1]
            } else {
                if(client.vclib.loopQueue) {
                    if(client.vclib.shuffled) {
                        client.vclib.shuffled = false;
                        client.vclib.beforeShuffle = null;
                    } else client.vclib.queue.shift();
                }
                if(client.vclib.lQueue.length > 0 && client.vclib.queue.length < 1) {
                    for(r of client.vclib.lQueue) client.vclib.queue.push(r)
                }
                if(client.vclib.loopQueue) video = client.vclib.queue[0]
                if(video[4].fromPlaylist) {
                    let stream = await client.vclib.getAudioStream(video[4].url)
                    if(video[4].youtube) video[1] = createAudioResource(stream)
                    else video[1] = createAudioResource(stream.stream, {
                        inputType: stream.type
                    })
                }
                if(client.vclib.loopCurrent) {
                    let stream = await client.vclib.getAudioStream(video[2])
                    if(!stream.stream) video[1] = createAudioResource(stream)
                    else video[1] = createAudioResource(stream.stream, {
                        inputType: stream.type
                    })
                }
                return video[1]
            }
        }

        client.vclib.loopQueueToggle = (on) => {
            if(on) client.vclib.queue.forEach(r => client.vclib.lQueue.push(r))
            else client.vclib.lQueue = [];
            client.vclib.loopQueue = on;
        }

        client.vclib.search = async (text, options) => {
            let searchResults = await play.search(text, options)
            return searchResults
            // if(!searchResults.results && searchResults.results.length < 1) return [];
            // return searchResults.results.filter(r => r.kind == 'youtube#video')
        }

        client.vclib.getAudioStream = async (url) => {
            if(url.includes('youtu.be') || url.includes('youtube.com')) return ytdl(url.split('&list')[0], {
                highWaterMark: 1 << 25,
                filter: 'audioonly',
                liveBuffer: 2000
            })
            else return await play.stream(url, { "discordPlayerCompatibility": true })
        }

        client.vclib.stop = (channel) => {
            client.vclib.loopCurrent = false;
            client.vclib.currentPlayer.stop();
            delete client.vclib.currentPlayer;
            client.vclib.currentPlayer = null;
            delete client.vclib.queue;
            client.vclib.queue = [];
            client.soundlib.sndplayerSubscribed = [];
            let connection = client.vclib.getConnection(channel);
            connection.destroy();
            client.vclib.currentConnection = null;
            return;
        }

        client.vclib.getInfo = async (url, type) => {
            if(!url) return;
            if(type.includes('so')) return await play.soundcloud(url)
            if(type.includes('sp')) return await play.spotify(url)
            if(type.includes('dz')) return await play.deezer(url)
            if(type == 'yt_video') return (await play.video_info(url)).video_details
            if(type == 'yt_playlist') return (await play.playlist_info(url))
            return
        }

        client.vclib.getSource = type => {
            if(!type) return;
            if(type == 'yt_video') return { youtube: 'video' };
            if(type == 'yt_playlist') return { youtube: 'playlist' };
            if(type == 'dz_track') return { deezer: 'track' };
            if(type == 'sp_track') return { spotify: 'track' };
            if(type == 'so_track') return { soundcloud: 'tracks' };
            return
        }

        client.vclib.parsePlaylistRawInfo = async rawInfo => {
            if(!rawInfo) return;
            if(rawInfo instanceof play.YouTubePlayList) {
                return {
                    name: rawInfo.title,
                    url: rawInfo.url,
                    tracks: (await rawInfo.fetch()).all_videos,
                    thumbnail: rawInfo.thumbnail ? rawInfo.thumbnail.url : (await rawInfo.all_videos())[0].thumbnails[0].url,
                    author: rawInfo.channel.name,
                    playlist: true
                }
            }
            if(rawInfo instanceof play.DeezerPlaylist) {
                return {
                    name: rawInfo.title,
                    url: rawInfo.url,
                    tracks: (await rawInfo.fetch()).tracks,
                    thumbnail: rawInfo.picture.medium,
                    author: rawInfo.creator.name,
                    playlist: true
                }
            }
            if(rawInfo instanceof play.SoundCloudPlaylist) {
                return {
                    name: rawInfo.name,
                    url: rawInfo.url,
                    tracks: (await rawInfo.fetch()).tracks,
                    thumbnail: rawInfo.tracks[0].thumbnail,
                    author: rawInfo.user.name,
                    playlist: true
                }
            }
            if(rawInfo instanceof play.SpotifyPlaylist) {
                return {
                    name: rawInfo.name,
                    url: rawInfo.url,
                    tracks: (await rawInfo.fetch()).all_tracks,
                    thumbnail: rawInfo.thumbnail.url,
                    author: rawInfo.owner.name,
                    playlist: true
                }
            }
        }

        client.vclib.parseRawInfo = async rawInfo => {
            if(!rawInfo) return;

            if(rawInfo instanceof play.YouTubeVideo) {
                return {
                    name: rawInfo.title,
                    url: rawInfo.url,
                    thumbnail: rawInfo.thumbnails[rawInfo.thumbnails.length - 1].url,
                    author: rawInfo.channel.name,
                    duration: rawInfo.durationInSec,
                    playlist: false
                }
            } else if(rawInfo instanceof play.DeezerTrack) {
                return {
                    name: rawInfo.shortTitle,
                    url: rawInfo.url,
                    thumbnail: rawInfo.album.cover.medium,
                    author: rawInfo.artist.name,
                    duration: rawInfo.durationInSec,
                    playlist: false
                }
            } else if(rawInfo instanceof play.SoundCloudTrack) {
                return {
                    name: rawInfo.name,
                    url: rawInfo.url,
                    thumbnail: rawInfo.thumbnail,
                    author: rawInfo.user.name,
                    duration: rawInfo.durationInSec,
                    playlist: false
                }
            } else if(rawInfo instanceof play.SpotifyTrack) {
                return {
                    name: rawInfo.name,
                    url: rawInfo.url,
                    thumbnail: rawInfo.thumbnail.url,
                    author: rawInfo.artists.map(a => a.name).join(", "),
                    duration: rawInfo.durationInSec,
                    playlist: false
                }
            } else if(rawInfo instanceof play.SoundCloudPlaylist ||
                rawInfo instanceof play.DeezerPlaylist ||
                rawInfo instanceof play.YouTubePlayList ||
                rawInfo instanceof play.SpotifyPlaylist
            ) return await client.vclib.parsePlaylistRawInfo(rawInfo)
        }

        client.vclib.validate = async (url) => {
            if((url.includes('youtu.be') || url.includes('youtube.com')) && url.includes('&list')) return 'yt_playlist'
            if(url.includes('youtu.be') || url.includes('youtube.com')) return 'yt_video'
            if(url.includes('soundcloud.com') && url.includes('sets')) return 'so_playlist'
            if(url.includes('soundcloud.com')) return 'so_track'
            return await play.validate(url)
        }

        client.vclib.play = async (options) => {
            if(play.is_expired()) await play.refreshToken()
            // console.log(options)
            let rawInfo = null;
            if(options.mode == 'search') {
                rawInfo = await client.vclib.search(options.query, { source: client.vclib.getSource(options.type) })
                rawInfo = rawInfo[0]
            }
            if(options.mode == 'url') rawInfo = await client.vclib.getInfo(options.url, options.type)
            // console.log(rawInfo)
            let info = await client.vclib.parseRawInfo(rawInfo)
            if(!info) return;
            console.log(info)
            if(!info.playlist) {
                let stream = await client.vclib.getAudioStream(info.url)
            // stream.pipe(process.stdout)
            // stream.stream.pipe(process.stdout)
                let resource = null;
                if(rawInfo instanceof play.YouTubeVideo) resource = createAudioResource(stream)
                else resource = createAudioResource(stream.stream, {
                    inputType: stream.type
                })
                let channel = options.channel;
            // let info = await ytdl.getInfo(video)
                client.vclib.queue.push([channel, resource, info.url, info.name, info])
                if(client.vclib.loopQueue) client.vclib.lQueue.push([channel, resource, info.url, info.name, info])
                if(client.vclib.queue.length == 1) await client.vclib.playQueue()
                return info;
            } else {
                // importing playlist
                console.log(info.tracks)
                let totalDuration = 0;
                for(track of info.tracks) {
                    let trackInfo = await client.vclib.parseRawInfo(track)
                    totalDuration += trackInfo.duration;

                    let channel = options.channel;
                    trackInfo.fromPlaylist = true
                    if(track instanceof play.YouTubeVideo) trackInfo.youtube = true
                    else trackInfo.youtube = false
                    client.vclib.queue.push([channel, null, trackInfo.url, trackInfo.name, trackInfo])
                    console.log(trackInfo)
                    if(client.vclib.loopQueue) client.vclib.lQueue.push([channel, null, trackInfo.url, trackInfo.name, trackInfo])
                }
                info.totalDuration = totalDuration
                if(client.vclib.queue.length == info.tracks.length) await client.vclib.playQueue()
                return info;
            }
        }

        client.log(0, 'loaded voice library', 'voicelib');
    }
}