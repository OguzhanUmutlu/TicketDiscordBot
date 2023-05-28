const {GuildMember, TextChannel} = require("discord.js");

cmd(
    new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Manages the ticket")
        .addSubcommand(o => o
            .setName("adduser")
            .setDescription("Adds a user to ticket.")
            .addUserOption(o => o.setName("user").setDescription("User to add to the ticket.").setRequired(true))
        )
        .addSubcommand(o => o
            .setName("removeuser")
            .setDescription("Removes a user from ticket.")
            .addUserOption(o => o.setName("user").setDescription("User to remove from the ticket.").setRequired(true))
        )
        .addSubcommand(o => o
            .setName("close")
            .setDescription("Closes the ticket.")
        ),
    async interaction => {
        const subCommand = interaction.options.getSubcommand();
        const supportRoles = env.supportRoles.split(",");
        const ticket = await TicketManager.getTicketByChannelId(interaction.channel.id);
        const reply = (s, ephemeral = true) => interaction.reply({content: s, ephemeral});
        if (!ticket) return reply("Use this command in ticket channel!");
        if (subCommand === "adduser" || subCommand === "removeuser") {
            let isAdd = subCommand === "adduser";
            if (!interaction.member.roles.cache.some(i => supportRoles.includes(i.id)) && !interaction.member.permissions.has("ADMINISTRATOR")) return interaction.reply("You cannot use this command!");
            const userId = interaction.options.getUser("user");
            const member = interaction.guild.members.cache.get(userId) || await interaction.guild.members.fetch(userId);
            if (!(member instanceof GuildMember)) return interaction.reply("Member not found.");
            if (member.permissions.has("ADMINISTRATOR")) return interaction.reply("This user is an admin!");
            if (interaction.channel.permissionOverwrites.has(userId) === isAdd) return interaction.reply("This user is already" + (!isAdd ? " not" : "") + " added to this ticket!");
            await interaction.channel.permissionOverwrites.edit(userId, {ViewChannel: isAdd});
            reply("<@" + userId + "> has been " + (isAdd ? "added to" : "removed from") + " the ticket!", false);
        } else if (subCommand === "close") {
            const guild = client.guilds.cache.get(env.guildId);
            if (!guild) return reply("Server not found.");
            const channel = guild.channels.cache.get(ticket.channelId);
            if (channel instanceof TextChannel) await channel.delete("Closed ticket.");
            else return reply("Channel not found.");
            await TicketManager.removeTicket(ticket.userId);
        }
    }
);