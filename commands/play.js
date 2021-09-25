const ytdl = require('ytdl-core');
const search = require('./procura.js')

const execute = async (message) => {
    if (!message.guild) return;
    if (!message.member.voice.channel) return message.reply('entra num canal de voz corno');
    /* Even faster that way */

    voiceChannel = await message.member.voice.channel
    if (typeof queue !== 'undefined' && queue.length){
        /* queue instanceof Array wasn't working here, idk y
        checks if lenght of q is not zero */
        set_queue(message)
    }else{
        set_queue(message)
        try{
            connection = await voiceChannel.join()
            play(message)
        }
        catch(err){
            console.log(err)
        }
    }
};

async function play(message){
    if (queue.length == 0){
        voiceChannel.leave()
        delete queue;

        return;
    }
    dispatcher = connection.play(ytdl(queue[0], { filter: 'audioonly'}))

    dispatcher.setVolume(0.1)/* if this is on the bottom it doesn't consolelog the volume properly */
    
    dispatcher.on("finish", () =>{
        queue.shift()
        play(queue[0])
    })
}

const set_queue =  async (message) => {
    queue = ( typeof queue != 'undefined' && queue instanceof Array ) ? queue : []
    commands = (message.content).split(' ')
    
    link = commands.slice(1,commands.length).join(' ')

    if (!ytdl.validateURL(link)){
        link = `https://www.youtube.com/watch?v=${ await search.execute(link)}`
    }
    console.log(link)
    queue.push(link)
}

const skip = async (message) => {
    if (typeof queue === 'undefined') return message.reply('tu quer pular música inexistente?');
    return await dispatcher.end(), message.reply("Pulei essa música!");
}

module.exports = {
    skip,
    name: 'play',
    description: 'Plays a song',
    execute,
};
