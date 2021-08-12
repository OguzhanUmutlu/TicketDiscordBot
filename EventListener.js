const Discord = require("discord.js");
const {TextChannel} = require("discord.js");

module.exports = client => {
    client.on("ready", async () => {
        const env = require("./index").getEnv();
        const buttons = require("./index").getButtons();
        const guild = client.guilds.cache.get(env.guildId);
        if(!guild) return console.error("Guild not found!");
        const channel = guild.channels.cache.get(env.channelId);
        if(!(channel instanceof TextChannel)) return console.error("Channel not found!");
        await channel.bulkDelete(100);
        channel.send(new Discord.MessageEmbed()
                .setAuthor(guild.name, guild.iconURL())
                .setThumbnail(guild.iconURL())
                .setColor("RANDOM")
                .setDescription("You can create ticket by clicking button down below!"),
            new buttons.MessageButton()
                .setLabel("Create ticket")
                .setID("createTicketButton")
                .setStyle("blurple")
        );
    });
    client.on("clickButton", async button => {
        if(button.id !== "createTicketButton") return;
        const user = button.clicker;
        const TicketManager = require("./index").getTicketManager();
        const channel = await TicketManager.createTicket(user.id);
        if(!(channel instanceof TextChannel)) {
            switch(channel) {
                case -1:
                    button.reply.send("You already have a ticket!", true);
                    break;
                case -2:
                    button.reply.send("Guild not found!", true);
                    break;
                case -3:
                    button.reply.send("Member not found! Please try to send message in some channel!", true);
                    break;
                case -4:
                    button.reply.send("Category not found!", true);
                    break;
                default:
                    button.reply.send("Invalid ticket error " + channel, true);
                    break;
            }
        } else {
            button.reply.send("Your ticket has been created in <#" + channel.id + ">!", true);
        }
    })
    client.on("message", require("./command/CommandManager").handleMessage);
}