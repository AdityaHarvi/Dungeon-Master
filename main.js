const Discord = require("discord.js"),
    client = new Discord.Client(),
    getToken = require("./botToken"),
    PREFIX = "!",
    database = require("./databaseHandler/dbHandler"),
    error = require('./util/error'),
    gameHandler = require('./startup/gameStatusHandler'),
    display = require('./displayInfo/displayInfo'),
    upload = require('./util/upload'),
    help = require('./displayInfo/help'),
    drop = require('./util/removeItem'),
    equip = require('./util/equip'),
    transfer = require('./util/transferItem'),
    journal = require('./util/journal'),
    attack = require('./combat/attack'),
    cast = require('./combat/cast'),
    useItem = require('./combat/useItem'),
    bleed = require('./combat/bleed'),
    adminModifyInventory = require('./admin/modifyInventory'),
    adminModifyStats = require('./admin/modifyStats'),
    adminRoll = require('./admin/rollForAll'),
    ally = require('./admin/ally'),
    purge = require('./admin/purge');

let activeGameObject;

// Log into the bot.
client.login(getToken.getToken());

// Startup
client.on('ready', () => {
    database.createDB();
    client.user.setActivity('!help');
    console.log('System is online.');
});

function setActiveGameObject(newGameObject) {
    activeGameObject = newGameObject;
}

function _errorChecksPass(gameObject, msg) {
    if (!gameObject) {
        error.error("Error finding an active game.", "Create one with `!play <campaign name>`.", msg);
        return false;
    }

    if (msg.channel.id != gameObject.hostChannel && msg.channel.id != gameObject.playerChannel) {
        error.error(`This command can only be run in \`${gameObject.game_title}\`'s game channels.`, null, msg);
        return false;
    }

    if (!gameObject.players.includes(msg.author.username)) {
        msg.react("❌");
        msg.author.send(`Unfortunately, you are not a part of the active game: \`${gameObject.game_title}\`.`);
        return false;
    }

    return true;
}

client.on('message', msg => {
    // Error handling to ensure bot does not respond to itself and to only reply when commands are said in specific channels.
    if (msg.author.bot || !msg.content.startsWith(PREFIX) || !msg.member) return;

    let args = msg.content.substring(PREFIX.length).split(" ");
    args[0] = args[0].toLowerCase();

    switch(args[0]) {
        // Handles displaying information on items / spells / abilities / classes / inventory.
        case "help":
            help.baseMenu(activeGameObject && activeGameObject.host, activeGameObject && activegameObject.game_title, msg);
            break;
        case "item":
            (args[1]) ?
                display.itemInfo(args, msg) :
                error.error("What is the item name?", "`!item <name>`", msg);
            break;
        case "spell":
            (args[1]) ?
                display.spellInfo(args, msg) :
                error.error("What is the spell name?", "!spell <name>", msg);
            break;
        case "class":
            display.classMenuUi(msg);
            break;
        case "info":
            if (_errorChecksPass(activeGameObject, msg)) display.playerInfo(msg.author.username, activeGameObject, msg);
            break

        // Handles game status.
        case "create":
            (args[1]) ?
                gameHandler.setupGame(args, msg) :
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

        case "roll":
            if (args[1] && isNaN(args[1])) return error.error("Incorrect arguments.", "`!roll <optional: dice size>` is the proper format. Defaults to D20 if no size is given.", msg);
            display.diceRoll(args[1], activeGameObject.game_title, msg);
            break;

        default:
            // if (activeGameObject) database.giveSpell("Laggy", activeGameObject, "huzzah", msg);
            msg.react("❓");
    }
});

exports.setActiveGameObject = setActiveGameObject;
