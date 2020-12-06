const Discord = require("discord.js"),
    client = new Discord.Client(),
    getToken = require("./botToken"),
    PREFIX = "!",
    error = require('./util/error'),
    gameHandler = require('./startup/gameStatusHandler'),
    getInfo = require('./gameInfo/getInfo'),
    displayInfo = require('./gameInfo/displayInfo'),
    startup = require('./startup/startup'),
    upload = require('./util/upload'),
    help = require('./util/help'),
    drop = require('./util/removeItem'),
    equip = require('./util/equip'),
    transfer = require('./util/transferItem'),
    journal = require('./util/journal'),
    diceRoll = require('./util/diceRoll'),
    attack = require('./combat/attack'),
    cast = require('./combat/cast'),
    useItem = require('./combat/useItem'),
    activate = require('./combat/activate'),
    bleed = require('./combat/bleed'),
    adminHelp = require('./admin/help'),
    adminModifyInventory = require('./admin/modifyInventory'),
    adminModifyStats = require('./admin/modifyStats'),
    adminRoll = require('./admin/rollForAll'),
    ally = require('./admin/ally'),
    purge = require('./admin/purge');

// Log into the bot.
client.login(getToken.getToken());

// Startup
client.on('ready', () => {
    console.log('System is online.');
    client.user.setActivity('!help');
});

client.on('message', msg => {
    // Error handling to ensure bot does not respond to itself and to only reply when commands are said in specific channels.
    if (msg.author.bot || !msg.content.startsWith(PREFIX) || !msg.member) return;

    let args = msg.content.substring(PREFIX.length).split(" ");
    args[0] = args[0].toLowerCase();

    switch(args[0]) {
        case "create":
            (args[1]) ?
                gameHandler.setupGame(args, client, msg) :
                error.error("What is the campaign name?", "`!create <Campaign Name>`", msg);
            break;
        case "pause":
            (args[1]) ?
                gameHandler.pauseGame(args, msg) :
                error.error("What is the campaign name?", "`!pause <Campaign Name>`", msg);
            break;
        case "end":
            (args[1]) ?
                gameHandler.endGame(args, msg) :
                error.error("What is the campaign name?", "`!end <Campaign Name>`", msg);
            break;
        case "play":
            (args[1]) ?
                gameHandler.playGame(args, msg) :
                error.error("What is the campaign name?", "`!play <Campaign Name>`", msg);
            break;
        default:
            error.error("This is an unknown command.", "`!help` for a list of commands.", msg);;
    }
})
