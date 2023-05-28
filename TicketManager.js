const {CategoryChannel, TextChannel, PermissionFlagsBits} = require("discord.js");

const DB_ERR = false;
const query = async (sql, ...args) => new Promise(r => db.all(sql, args, (err, rows) => {
    if (err) {
        if (DB_ERR) console.err(err);
        return r([]);
    }
    r(rows);
}));
const exec = async (sql, ...args) => new Promise(r => db.run(sql, args, (err, rows) => {
    if (err) {
        if (DB_ERR) console.err(err);
        return r([]);
    }
    r(rows);
}));

exec(`CREATE TABLE tickets
      (
          userId    VARCHAR,
          channelId VARCHAR
      )`).then(r => r);

global.TicketManager = new class {
    async getTicket(userId) {
        return (await query(`SELECT *
                             FROM tickets
                             WHERE userId = ? LIMIT 1`, userId))[0];
    };

    async addTicket(userId, channelId) {
        return await exec(`INSERT INTO tickets (userId, channelId)
                           VALUES (?, ?)`, userId, channelId);
    };

    async getTicketByChannelId(channelId) {
        return (await query(`SELECT *
                             FROM tickets
                             WHERE channelId = ? LIMIT 1`, channelId))[0];
    };

    async createTicket(userId, username) {
        if (await this.getTicket(userId)) return -1;
        const guild = client.guilds.cache.get(env.guildId);
        if (!guild) return -2;
        const member = guild.members.cache.get(userId);
        if (!member) return -3;
        const category = guild.channels.cache.get(env.categoryId);
        if (!(category instanceof CategoryChannel)) return -4;
        const permissionOverwrites = [
            {id: guild.id, deny: [PermissionFlagsBits.ViewChannel]},
            {id: userId, allow: [PermissionFlagsBits.ViewChannel]}
        ];
        env.supportRoles.split(",").filter(i => i).forEach(i => {
            permissionOverwrites.push({id: i, allow: [PermissionFlagsBits.ViewChannel]});
        });
        const channel = await guild.channels.create({
            name: username,
            parent: category,
            permissionOverwrites: permissionOverwrites
        });
        await this.addTicket(userId, channel.id);
        return channel;
    };

    async removeTicket(userId) {
        return await exec(`DELETE
                           FROM tickets
                           WHERE userId = ?`, userId);
    };
}