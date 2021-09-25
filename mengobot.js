const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
});
console.log(client.commands)
/* reads the commands from the other file and creates a set to it */


client.once("ready", async message => {
	console.log("Ready!")
});

client.on('guildMemberAdd', member => {
	const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
	if (!channel) return;
	channel.send(`Gay ${member}!`);
})

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);

	const command = args.shift().toLowerCase();
		try {
			client.commands.get(command).execute(message, client, args);
		} catch (error) {
			console.error(error);
			message.reply('Erro');
		}
});
/* Executes the commands */
  
client.login(token);
