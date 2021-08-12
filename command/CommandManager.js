const prefix = require("../index").getEnv().prefix;
const commands = [];
const Command = require("./Command");
const CloseTicketCommand = require("./commands/CloseTicketCommand");
const AddUserCommand = require("./commands/AddUserCommand");
const RemoveUserCommand = require("./commands/RemoveUserCommand");
const {getEnv} = require("../index");

const CommandManager = new class {
    init() {
        this.registerCommand(new CloseTicketCommand(), true);
        this.registerCommand(new AddUserCommand(), true);
        this.registerCommand(new RemoveUserCommand(), true);
    }

    registerCommand(command, force = false) {
        if(!(command instanceof Command)) throw new Error("Command expected " + typeof(command) + " provided!");
        command.name = command.name.toString().toLowerCase();
        command.aliases = command.aliases.map(i=> i.toString().toLowerCase());
        if(!force && commands[command.name]) throw new Error("Command named " + command.name + " already exists!");
        commands[command.name] = command;
        console.log(command.name.charAt(0).toUpperCase() + command.name.split("").slice(1).join("") + " command registered!")
    }

    unregisterCommand(command) {
        delete commands[command.name];
    }

    async handleMessage(message) {
        if (!message.content.startsWith(getEnv().prefix)) return;
        let arg = message.content.replace(prefix, "").split(" ");
        let cmd = commands[arg[0].toLowerCase()] || commands.filter(i => i.aliases.includes(arg[0].toLowerCase()))[0];
        let args = arg.slice(1);
        if (!(cmd instanceof Command)) return;
        await cmd.execute(message.client, message, args);
    }
};
CommandManager.init();
module.exports = CommandManager;