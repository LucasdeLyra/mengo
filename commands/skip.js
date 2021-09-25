const next = require('./play.js')

const execute = async (message) => {
    if (!message.guild) return;
    if (!message.member.voice.channel) return message.reply('Entra num canal de voz corno');
    next.skip(message)

};
  
module.exports = {
    name: 'skip',
    description: 'Skips a song',
    execute,
};