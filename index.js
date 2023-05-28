const fs = require("fs");
const {
    Client, GatewayIntentBits, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel,
    ButtonBuilder, PartialTextBasedChannelFields, TextBasedChannelFields, ButtonInteraction,
    SlashCommandSubcommandsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandGroupBuilder, ActionRowBuilder, EmbedBuilder
} = require("discord.js");

global.client = new Client({intents: Object.values(GatewayIntentBits).filter(Number)});
global.SlashCommandBuilder = SlashCommandBuilder;
require("fancy-printer").makeGlobal(true).makeLoggerFile();
require("./EnvReader");
const {Database} = require("sqlite3").verbose();
global.db = new Database("./data.db");
require("./TicketManager");

global.commands = {};
/**
 * @param {SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandGroupBuilder} builder
 * @param {(interaction: ChatInputCommandInteraction) => Promise<void>} execute
 */
global.cmd = (builder, execute) => commands[builder.name] = {builder, execute};

(async () => {
    for (const file of fs.readdirSync("commands")) {
        if (!file.endsWith(".js")) continue;
        try {
            require("./commands/" + file);
        } catch (e) {
            console.error("Couldn't load the command file: " + file, e);
        }
    }
    console.info("Loaded commands.");
    const readyPromise = new Promise(r => client.once("ready", r));
    await client.login(env.token);
    await readyPromise;
    console.info("Logged in.")
    for (const guild of client.guilds.cache.toJSON()) {
        try {
            await guild.commands.fetch({cache: true});
            await guild.commands.set(Object.values(commands).map(i => i.builder));
        } catch (e) {
            console.err(e);
        }
    }
    console.info("Updated slash commands.");
    client.on("interactionCreate", async interaction => {
        if (interaction.user.bot) return;
        if (interaction instanceof ChatInputCommandInteraction) {
            const command = commands[interaction.commandName];
            if (command) await command.execute(interaction);
        } else if (interaction instanceof ButtonInteraction) {
            if (interaction.customId !== "create-ticket") return;
            const channel = await TicketManager.createTicket(interaction.user.id, interaction.user.username);
            if (!(channel instanceof TextChannel)) {
                switch (channel) {
                    case -1:
                        interaction.reply({
                            content: "You already have a ticket!",
                            ephemeral: true
                        });
                        break;
                    case -2:
                        interaction.reply({
                            content: "Guild not found!",
                            ephemeral: true
                        });
                        break;
                    case -3:
                        interaction.reply({
                            content: "Member not found! Please try to send message in some channel!",
                            ephemeral: true
                        });
                        break;
                    case -4:
                        interaction.reply({
                            content: "Category not found!",
                            ephemeral: true
                        });
                        break;
                    default:
                        interaction.reply({
                            content: "Invalid ticket error " + channel,
                            ephemeral: true
                        });
                        break;
                }
            } else {
                interaction.reply({
                    content: "Your ticket has been created in <#" + channel.id + ">!",
                    ephemeral: true
                });
            }
        }
    });
    const guild = client.guilds.cache.get(env.guildId);
    if (!guild) {
        console.error("Guild not found!");
        process.exit();
    }
    /*** @type {TextBasedChannelFields | PartialTextBasedChannelFields} */
    const channel = guild.channels.cache.get(env.channelId);
    if (!(channel instanceof TextChannel)) {
        console.error("Channel not found!");
        process.exit();
    }
    if ((await channel.messages.fetch()).toJSON().some(i => i.author.id === client.user.id)) return;
    await channel.send({
        embeds: [new EmbedBuilder()
            .setAuthor({name: guild.name, iconURL: guild.iconURL()})
            .setThumbnail(guild.iconURL())
            .setColor("#36393F")
            .setDescription("You can create ticket by clicking button down below!")],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("create-ticket")
            .setLabel("Create ticket")
            .setStyle("Primary"))]
    });
})();