/**
 * Full credits go to Gabriel Truner for the execute, stop & play functions.
 * URL: https://gabrieltanner.org/blog/dicord-music-bot
 * Access Date: 2020/12/28
 */

const queue = require("../main")
    ytdl = require("ytdl-core");

async function execute(msg) {
    let serverQueue = queue.getQueue(msg.guild.id);
    const args = msg.content.split(" ");

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
        return msg.channel.send("I can only join a VC that you're connected to.");

    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
        return msg.channel.send("I don't have the required permissions to join and speak in your voice channel!");

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.queueSet(msg.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(msg.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.queueDelete(msg.guild.id);
            return msg.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return msg.channel.send(`${song.title} has been added to the queue.`);
    }
}

function skip(msg) {
    let serverQueue = queue.getQueue(msg.guild.id);
    if (!msg.member.voice.channel)
        return msg.channel.send("You have to be in a voice channel to stop the music.");
    if (!serverQueue)
        return msg.channel.send("There is no song that I could skip.");
    serverQueue.connection.dispatcher.end();
}

function stop(msg) {
    let serverQueue = queue.getQueue(msg.guild.id);
    if (!msg.member.voice.channel)
        return msg.channel.send("You have to be in a voice channel to stop the music.");

    if (!serverQueue)
        return msg.channel.send("There is no song that I could stop.");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.getQueue(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.queueDelete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

exports.execute = execute;
exports.skip = skip;
exports.stop = stop;
exports.play = play;
