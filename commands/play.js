const ytdl = require('ytdl-core');
const {google} = require('googleapis');
const {google_key} = require('./key.json');
const video = require('ffmpeg/lib/video');
const SpotifyWebApi = require('spotify-web-api-node');
const { MessageFlags } = require('discord.js');


const youtube = google.youtube({
    version: 'v3',
    auth: google_key
});
const spotifyApi = new SpotifyWebApi({
    clientId: 'YOUR_SPOTIFY_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
  });


var already_searched = []
var already_searched_videoID = []


const execute = async (message) => {
    if (!message.guild) return;
    if (!message.member.voice.channel) return message.reply('You are not in a voice channel');
    /* Even faster that way */

    voiceChannel = await message.member.voice.channel
    if (typeof queue !== 'undefined' && queue.length){
        await set_queue(message)
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
    let commands = (message.content).split(' ')
    let link = commands.slice(1,commands.length).join(' ')
    let isYT = ytdl.validateURL(link)

    if (!(await valid_spotify_link(message))){
        if (!isYT){
            link = `https://www.youtube.com/watch?v=${ await search(link)}`
        }  
        else{
            if (await ageRestricted(ytdl.getVideoID(link)) == true){
                return message.channel.send('That is age restricted')
            }
        }
        queue = ( typeof queue != 'undefined' && queue instanceof Array ) ? queue : []
        queue.push(link)
    }
    else{
        await spotify(message)
    }
}


const ageRestricted = async (videoId) => {
    try{
        const response = await youtube.videos.list({
            part: 'contentDetails',
            id: videoId,
            type: 'video',
            regionCode: 'BR',
            maxResults: 1
        })
        if (response.data.items[0].contentDetails.contentRating.ytRating != null ){
            return true
        }
    
    }catch(err){
        console.log(err)
    }
    
    return false
}


const search = async (songtitle) => {
    let i = 0
    let is_age_restricted = true
    if (already_searched.indexOf(songtitle) == -1){
        console.log('entrou no search')
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
                    is_age_restricted = await ageRestricted(videoId)
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


const get_spotify_credential = async () => {
    await spotifyApi.clientCredentialsGrant().then(
        function(data) {
          console.log('The access token expires in ' + data.body['expires_in']);
          console.log('The access token is ' + data.body['access_token']);
      
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
          console.log('Something went wrong when retrieving an access token', err);
        }
    );
}

const refresh_spotify_credential = async () => {
    spotifyApi.refreshAccessToken().then(
        function(data) {
          console.log('The access token has been refreshed!');
      
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
          console.log('Could not refresh access token', err);
        }
      );
}

const valid_spotify_link = async (message) => {
    let commands = (message.content).split(' ')
    let link = commands.slice(1,commands.length).join(' ')
    link = link.split('/')
    if (link[2] != 'open.spotify.com'){
        return false
    }
    return true
}


const spotify = async (message) =>{
    
    await get_spotify_credential()
    let commands = (message.content).split(' ')
    let link = commands.slice(1,commands.length).join(' ')
    link = link.split('/')
    let id = link[link.length-1]
    console.log(id)

    var to_search = []


    await spotifyApi.getPlaylist(id)
        .then(function(data) {
            data.body.tracks.items.forEach(item => to_search.push(`${item.track.name} by ${item.track.artists[0].name}`))
        }, function(err) {
            console.log('Something went wrong!', err);
        });

    for (let i=0; i<to_search.length; i++){
        link =  `https://www.youtube.com/watch?v=${await search(to_search[i])}`
        queue = ( typeof queue != 'undefined' && queue instanceof Array ) ? queue : []
        queue.push(link)
    }

    return message.reply('Some songs may not been found')
     
}


const skip = async (message) => {
    if (typeof queue === 'undefined') return message.reply('There is nothing in the queue to skip');

    let id = ytdl.getVideoID(queue[0])
    if (already_searched_videoID.indexOf(id) == -1){
        video_title = queue[0]
    }
    else{
        video_title = already_searched[already_searched_videoID.indexOf(id)]
    }

    message.reply(`Pulei "${video_title}"`)


    return await dispatcher.end();
}

module.exports = {
    skip,
    name: 'play',
    description: 'Plays a song',
    execute,
};