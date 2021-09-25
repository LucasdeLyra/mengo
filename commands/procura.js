const {google} = require('googleapis');
const {google_key} = require('./key.json')
const youtube = google.youtube({
    version: 'v3',
    auth: google_key
})


var already_searched = []
var already_searched_videoID = []

const execute = async (songtitle) => {
    if (already_searched.indexOf(songtitle) == -1){
        already_searched.push(songtitle)
        try{
            const response = await youtube.search.list({
                part: 'snippet',
                q: songtitle,
                type: 'video',
                regionCode: 'BR',
                maxResults: 1
            })
            //if (songs_Ids.indexOf(response.data.items[0].snippet.title) == -1){
                //songs_Ids = songs_Ids.concat(response.data.items.map((item) => item.snippet.title));
                //console.log(songs_Ids);
            //}
            videoId = response.data.items[0].id.videoId
            already_searched_videoID.push(videoId)
            return videoId
        }catch(err){
            console.log(err)
        }    
    }
    return already_searched_videoID[already_searched.indexOf(songtitle)]


};
  
module.exports = {
    name: 'procura',
    description: 'Searches a song',
    execute,
};