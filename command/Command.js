const Command = class Command {
    constructor(name, description = "", aliases = []) {
        if(!name) throw new TypeError("Command should have a valid name.");
        this.name = name;
        this.description = description;
        this.aliases = aliases;
    }

    async execute(client, message, args) {
    }
};
module.exports = Command;