const fs = require("fs");
const {CategoryChannel, TextChannel} = require("discord.js");
const {getClient, getEnv} = require("./index");
if(!fs.readdirSync(".").includes("tickets.json"))
    fs.writeFileSync("./tickets.json", "{}");
const tickets = JSON.parse(fs.readFileSync("./tickets.json").toString());

const TicketManager = new class {
    getTickets() {
        return tickets;
    }
    getTicket(userId) {
        return tickets[userId];
    }
    setTicket(userId, data) {
        tickets[userId] = data;
        fs.writeFileSync("./tickets.json", JSON.stringify(tickets));
    }
    deleteTicket(userId) {
        delete tickets[userId];
        fs.writeFileSync("./tickets.json", JSON.stringify(tickets));
    }
    async createTicket(userId) {
        if(this.getTicket(userId)) return -1;
        const client = getClient();
        const env = getEnv();
        const guild = client.guilds.cache.get(env["guildId"]);
        if(!guild) return -2;
        const member = guild.members.cache.get(userId);
        if(!member) return -3;
        const category = guild.channels.cache.get(env["categoryId"]);
        if(!(category instanceof CategoryChannel)) return -4;
        const permissionOverwrites = [
            {
                id: guild.id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: userId,
                allow: ["VIEW_CHANNEL"]
            }
        ];
        env["supportRoles"].split(",").forEach(i=> {
            permissionOverwrites.push({
                id: i,
                allow: ["VIEW_CHANNEL"]
            });
        });
        const channel = await guild.channels.create(userId, {
            type: "text",
            parent: category,
            permissionOverwrites: permissionOverwrites
        });
        this.setTicket(userId, {
            userId,
            channelId: channel.id
        });
        return channel;
    }
    async removeTicket(userId) {
        if(!this.getTicket(userId)) return -1;
        const env = getEnv();
        const guild = getClient().guilds.cache.get(env["guildId"]);
        if(!guild) return -2;
        const channel = guild.channels.cache.get(this.getTicket(userId).channelId);
        this.deleteTicket(userId);
        if(channel instanceof TextChannel)
            await channel.delete("Closed ticket.");
        else return -3;
        return 1;
    }
    getTicketByChannelId(channelId) {
        return Object.values(tickets).filter(i=> i.channelId === channelId)[0];
    }
}
module.exports = TicketManager;