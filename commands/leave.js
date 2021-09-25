const execute = (message) => {
    if (!message.guild) return;
    if (!message.member.voice.channel) return message.reply('entra num canal de voz corno');
    message.member.voice.channel.leave();
    delete queue /* it's necessary to reset the queue  */

};
  
module.exports = {
    name: 'leave',
    description: 'Force the bot to leave the voice channel!',
    execute,
};