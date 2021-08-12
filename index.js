module.exports = {};

const env = require("./EnvReader")();
module.exports.getEnv = () => {return env};

const {Client} = require("discord.js");
const client = new Client();
module.exports.getClient = () => {return client};

const buttons = require('discord-buttons');
buttons(client);
module.exports.getButtons = () => {return buttons};

const TicketManager = require("./TicketManager");
module.exports.getTicketManager = () => {return TicketManager};

require("./EventListener")(client);

client.login(env.token).then(r => r);