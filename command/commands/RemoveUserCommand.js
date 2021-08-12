const Command = require("../Command");
const {getTicketManager, getEnv} = require("../../index");

module.exports = class RemoveUserCommand extends Command {
    constructor() {
        super("remove", "Removes user from ticket.", []);
    }

    async execute(client, message, args) {
        const TicketManager = getTicketManager();
        const env = getEnv();
        const supportRoles = env["supportRoles"].split(",");
        const ticket = TicketManager.getTicketByChannelId(message.channel.id);
        if(!ticket) return message.reply("Use this command in ticket channel!");
        if(!message.member.roles.cache.some(i=> supportRoles.includes(i.id)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply("You cannot use this command!");
        const userId = message.mentions.users.first() ? message.mentions.users.first().id : args[0];
        if(!userId || userId.toString().length !== 18) return message.reply("User id/mention must be valid!");
        if(!message.channel.permissionOverwrites.has(userId)) return message.reply("This user is already not added to this ticket!");
        const old = message.channel.permissionOverwrites.array().map(i=> {
            return {
                id: i.id,
                allow: ["VIEW_CHANNEL"]
            }
        }).filter(i=> i.id !== userId);
        await message.channel.overwritePermissions(old);
        message.reply("User removed from ticket!");
    }
}