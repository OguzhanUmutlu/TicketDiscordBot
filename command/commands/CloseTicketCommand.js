const Command = require("../Command");
const {getTicketManager, getEnv} = require("../../index");

module.exports = class CloseTicketCommand extends Command {
    constructor() {
        super("close", "Closes ticket.", []);
    }

    async execute(client, message, args) {
        const TicketManager = getTicketManager();
        const env = getEnv();
        const supportRoles = env["supportRoles"].split(",");
        const ticket = TicketManager.getTicketByChannelId(message.channel.id);
        if(!ticket) return message.reply("Use this command in ticket channel!");
        if(!message.member.roles.cache.some(i=> supportRoles.includes(i.id)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply("You cannot use this command!");
        message.channel.send("Type `yes` in `10` seconds to accept ticket deletion.");
        message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, errors: ["time"], time: 10000})
            .then(collection => {
                if(message.channel.deleted) return;
                const m = collection.first();
                if(m.content.toLowerCase() !== "yes" && m.content.toLowerCase() !== "y") return m.reply("Action cancelled!");
                m.reply("Ticket will be removed in `5` seconds.");
                setTimeout(async () => {
                    const res = TicketManager.removeTicket(message.author.id);
                    switch (res) {
                        case -1:
                            message.reply("Ticket not found!");
                            break;
                        case -2:
                            message.reply("Guild not found!");
                            break;
                    }
                }, 5000);
            })
            .catch(() => {
                if(!message.channel.deleted)
                    message.reply("Action cancelled!");
            });
    }
}