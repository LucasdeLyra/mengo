const ytdl = require('ytdl-core');
const {google} = require('googleapis');
const {google_key} = require('./key.json')
const youtube = google.youtube({
    version: 'v3',
    auth: google_key
})

const execute = async (message) => {
    if (!message.guild) return;
    if (!message.member.voice.channel) return message.reply('entra num canal de voz corno');
    /* Even faster that way */

    voiceChannel = await message.member.voice.channel
    if (typeof queue !== 'undefined' && queue.length){
        set_queue(message)
    }else{
        await set_queue(message)
        if (typeof queue !== 'undefined' && queue.length){
            try{
                connection = await voiceChannel.join()
                play(message)
            }
            catch(err){
                console.log(err)
            }
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

    dispatcher.setVolume(0.1)
    
    dispatcher.on("finish", () =>{
        queue.shift()
        play(queue[0])
    })
}

const set_queue =  async (message) => {
    commands = (message.content).split(' ')
    link = commands.slice(1,commands.length).join(' ')

    if (!ytdl.validateURL(link)){
        link = `https://www.youtube.com/watch?v=${ await search(link)}`
    }
    else{
        if (await ageRestricted(ytdl.getVideoID(link)) == true){
            return message.channel.send('Quer escutar pornô no Bot??? Isso é restrito por idade')
        }
    }
    queue = ( typeof queue != 'undefined' && queue instanceof Array ) ? queue : []
    queue.push(link)
}


const ageRestricted = async (videoId) => {
    console.log('entrou no ageRestricted')
    try{
        const response = await youtube.videos.list({
            part: 'contentDetails',
            id: videoId,
            type: 'video',
            regionCode: 'BR',
            maxResults: 1
        })
        console.log(response.data.items[0])
        if (response.data.items[0].contentDetails.contentRating.ytRating != null ){
            return true
        }
    
    }catch(err){
        console.log(err)
    }

    console.log('passou no ageRestricted')
    
    return false
}


var already_searched = []
var already_searched_videoID = []


const search = async (songtitle) => {
    i = 1
    is_age_restricted = true

    if (already_searched.indexOf(songtitle) == -1){
        console.log('entrou aqui')
            try{
                const response = await youtube.search.list({
                    part: 'snippet',
                    q: songtitle,
                    type: 'video',
                    regionCode: 'BR',
                    maxResults: 4
                })
                while (is_age_restricted && i < 4){

                    videoId = response.data.items[i].id.videoId
                    is_age_restricted = ageRestricted(videoId)
                    i+=1
                }
            }catch(err){
                console.log(err)
            }

            already_searched.push(songtitle)
            already_searched_videoID.push(videoId)

            return videoId  
        
    }
    return already_searched_videoID[already_searched.indexOf(songtitle)]
};


const skip = async (message) => {
    if (typeof queue === 'undefined') return message.reply('tu quer pular música inexistente?');
    return message.reply(`Pulei ${queue[0]}`), await dispatcher.end();
}

module.exports = {
    skip,
    name: 'play',
    description: 'Plays a song',
    execute,
};