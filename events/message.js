const Discord = require('discord.js');
module.exports = {
    name: 'message',
    description: 'On new message',
	execute(client, message) {

        // Check for prefix 
        if (message.content.startsWith(client.config.prefix) || !message.author.bot){

            const args = message.content.slice(client.config.prefix.length).split(/ +/);
            const commandName = args.shift().toLowerCase();
                
            const command = client.commands.get(commandName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;

            if (command.guildOnly && message.channel.type !== 'text') {
                return message.reply('I can\'t execute that command inside DMs!');
            }

            if (command.args && !args.length){
                let reply = `You didn't provide any arguments, ${message.author}!`;

                if (command.usage) {
                    reply += `\nThe proper usage would be: \`${client.config.prefix}${command.name} ${command.usage}\``;
                }

                return message.channel.send(reply);
            }

            if (!client.cooldowns.has(command.name)){
                client.cooldowns.set(command.name, new Discord.Collection());
            }
            
            const now = Date.now();
            const timestamps = client.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
                }
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            try {
                command.execute(message, args);
            } catch (error){
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }   

        } else {
            // "Commands" without a prefix here
        }
    }
};