const Discord = require("discord.js"),
    client = new Discord.Client(),
    getToken = require("./botToken"),
    PREFIX = "!",
    database = require("./databaseHandler/dbHandler"),
    error = require('./util/error'),
    gameHandler = require('./startup/gameStatusHandler'),
    display = require('./displayInfo/displayInfo'),
    help = require('./displayInfo/help'),
    inv = require('./util/inventory'),
    combat = require("./util/combat"),
    dice = require("./util/dice"),
    adminModifyInventory = require('./admin/modifyInventory'),
    adminModifyStats = require('./admin/modifyStats'),
    ally = require('./admin/ally'),
    ui = require("./util/UImethods"),
    purge = require('./util/purge');

var activeGameObject;

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
        error.error("Error finding an active game.", "Create one with `!create <campaign name>` or resume a paused game with `!play <campaign name>`.", msg);
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

    let args = msg.content.substring(PREFIX.length).split(/\n| /);
    args[0] = args[0].toLowerCase();

    switch(args[0]) {
        // Handles displaying information on items / spells / abilities / classes / inventory.
        case "help":
            (activeGameObject) ?
                help.baseMenu(msg) :
                error.error("Unable to find an active game.", null, msg);
            break;
        case "item":
            (args[1]) ?
                display.itemInfo(args, msg) :
                error.error("What is the item name?", "`!item <item name>`", msg);
            break;
        case "spell":
            (args[1]) ?
                display.spellInfo(args, msg) :
                error.error("What is the spell name?", "!spell `<spell name>`", msg);
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

        // Inventory management commands.
        case "equip":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.equip(msg.author.username, msg.author.username, activeGameObject, args, msg) :
                error.error("What is the item you want to equip?", "`!equip <item name>`", msg);
            break;
        case "drop":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.drop(msg.author.username, msg.author.username, activeGameObject, args, msg) :
                error.error("What is the item name?", "This command is a little funky. Don't forget the `-` before the name and quantity.\n`!drop -<item name> -<quantity: optional>`", msg);
            break;
        case "give":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.transfer(msg.author.username, activeGameObject, args, msg) :
                error.error("What is the item name and who are you giving it to?", "`!give -<player name> -<item name> -<quantity: optional>`", msg);
            break;
        case "upload":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.upload(args[1], msg.author.username, activeGameObject.game_title, msg) :
                error.error("What is the imgur link?", "`!upload <imgur URL>`\nThis command only accepts imgur links. Please note that the link should end with a `.png` or `.gif` extension.", msg);
            break;
        case "add-note":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.addNote(args, msg.author.username, activeGameObject.game_title, msg) :
                error.error("What is the entry name and description?", "`!add-note -<entry name> -<description>`\nDon't forget the `-`'s.", msg);
            break;
        case "del-note":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                inv.removeNote(args, msg.author.username, activeGameObject.game_title, msg) :
                error.error("What is the entry name?", "`!del-note <entry name>`", msg);
            break;
        case "journal":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            inv.getJournal(msg.author.username, activeGameObject.game_title, msg);
            break;
        case "pay":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1] && args[2] && !isNaN(args[2])) ?
                inv.pay(args[1], args[2], msg.author.username, activeGameObject, msg) :
                error.error("Who are you paying and how much?", "`!pay <player name> <$>`\nThe second input is a number.", msg);
            break;

        // Combat commands.
        case "roll":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            if (args[1] && isNaN(args[1]) && args[1] > 0) return error.error("Incorrect inputs.", "`!roll <optional: dice size>` is the proper format. Defaults to D20 if no size is given.", msg);
            display.diceRoll(Number(args[1]), activeGameObject.game_title, msg);
            break;
        case "attack":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                combat.melee(args[1], msg.author.username, activeGameObject.game_title, msg) :
                error.error("Who are you attacking?", "Note that names of players or enemies is case sensitive.\n`!attack <enemy/player name>`", msg);
            break;
        case "bleed":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1] && !isNaN(args[1]) && args[1] > 0) ?
                combat.bleed(Number(args[1]), msg.author.username, activeGameObject.game_title, msg) :
                error.error("Incorrect input.", "The input should be a value for how much mana you want to regain.\n`!bleed <#>`", msg);
            break;
        case "use":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1]) ?
                combat.use(args, msg.author.username, activeGameObject.game_title, msg) :
                error.error("Incorrect input.", "`!use <item name>`\n**Word of caution:**\nDungeon Master will *not* error check your item usage. So if you are at max health and use another potion, it will *not* increase your health, but it *will* use up the potion.\n Use items carefully!", msg);
            break;
        case "cast":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            break;

        // Admin Commands.
        case "init":
            (_errorChecksPass(activeGameObject, msg) && ui.isHost(activeGameObject.host, msg.author.username)) ?
                dice.init(args[1], activeGameObject.players, activeGameObject.game_title, msg) :
                error.error("You need to be hosting the game to run this command.", null, msg);
            break;
        case "give-money":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1] && args[2] && !isNaN(args[2]) && ui.isHost(activeGameObject.host, msg.author.username)) ?
                database.giveMoney(args[1], activeGameObject.game_title, Number(args[2]), msg) :
                error.error("Who are you paying and how much?", "`!give-money <player name> <$>`", msg);
            break;
        case "take-money":
            if (!_errorChecksPass(activeGameObject, msg)) return;
            (args[1] && args[2] && !isNaN(args[2]) && ui.isHost(activeGameObject.host, msg.author.username)) ?
                database.spendMoney(args[1], activeGameObject.game_title, args[2], msg, () => msg.react("✅")) :
                error.error("Who are you taking money from and how much?", "`!take-money <player name> <$>`", msg);
            break;
        case "make-item":
            break;
        case "edit-item":
            break;
        case "make-spell":
            break;
        case "edit-spell":
            break;
        case "make-shop":
            break;
        case "unlock":
            break;

        // Misc commands.
        case "purge":
            (args[1] && !isNaN(args[1])) ?
                purge.purge(args[1], msg.author.username, activeGameObject.host, msg) :
                error.error("Your input needs to be a number.", "`!purge <#>`", msg);
            break;

        default:
            msg.react("❓");
    }
});

exports.setActiveGameObject = setActiveGameObject;
