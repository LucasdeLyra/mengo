const execute = async (message) => {
    if (!message.guild) return;
    commands = (message.content).split(' ')
    xingamentos = ['pinto cu bosta mijo', 'vai tomar no cu!', 'mama', 'chupa um canavial de rola ai', 'safoda', 'mocoronga', 'x1, lixo?', 'tu é filho do bluezão', 'gozei no teu olho', 'gozei na tua glabela', 'seu malandrola', 'seu subversivo', 'tigresa vip', 'filho de militar']
    x = Math.floor(Math.random() * (xingamentos.length))
    if (commands.length > 1){
        member = message.mentions.members.first()
        await message.channel.send(`${member}, ${xingamentos[x]}`)
    }
    else{
        return message.reply(xingamentos[x]);
    }
};
  
module.exports = {
    name: 'xinga',
    description: 'Swears the author or someone the author mentioned',
    execute,
};