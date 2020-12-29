const db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
    display = require("../displayInfo/displayInfo"),
    error = require("./error");

/**
 * Equip's a chosen item if the player has it in their inventory.
 * @param {string} playerName The name of the player.
 * @param {string} gameName The game name.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function equip(playerName, gameName, rawInput, msg) {
    let itemName = ui.getName(rawInput);
    db.equipItem(playerName, gameName, itemName, msg);
}

/**
 * Drops and item from the player inventory. If the item is currently equiped, then it will be unequiped and dropped.
 * @param {string} playerName The player name.
 * @param {object} gameObject The game object.
 * @param {array} rawInput The raw user input split into a array.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function drop(playerName, gameObject, rawInput, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 1 || dashAmount > 2)
        return error.error("This command accepts a max of 2 inputs.", "This command is a little funky. Don't forget the `-` before the name and quantity.\n`!drop -<item name> -<quantity: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[2] && (isNaN(parsedCommand[2]) || Number(parsedCommand[2]) <= 0))
        return error.error("The second input should be a positive numeric value.", "`!drop -<item name> -<quantity: optional>`", msg);

    db.dropItem(playerName, gameObject.game_title, parsedCommand[1], parsedCommand[2], msg, droppedAmount => {
        msg.channel.send(`\`${playerName}\` dropped \`${droppedAmount}\` \`${parsedCommand[1]}\`.`);
    });
}

/**
 * Allows the admin to remove items from a player/bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function adminRemoveItem(rawInput, gameObject, msg) {
    if (ui.dashAmount(rawInput) < 2)
        return error.error("Improper format.", "`!take-item -<player name> -<item name> -<quantity: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    rawInput.splice(1,1);

    drop(parsedCommand[1], gameObject, rawInput, msg);
}

/**
 * Allows the admin to remove a spell from a player/bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function adminRemoveSpell(rawInput, gameObject, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("Improper format.", "`!take-spell -<player name> -<spell name>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    db.takeSpell(parsedCommand[1], gameObject, parsedCommand[2], msg);
}

/**
 * Allows an admin to equip an item for a player/bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {array} playerList The player list.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function adminEquip(rawInput, playerList, gameName, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("This command takes exactly 2 inputs.", "`!a-equip -<player name to control> -<item to equip>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();
    if (!playerList.includes(parsedCommand[1]))
        return error.error(`Was not able to find ${parsedCommand[1]}`, null, msg);

    // Format the input so its usable by the equip function.
    rawInput.splice(1,1);
    rawInput[1] = rawInput[1].substr(1);

    equip(parsedCommand[1], gameName, rawInput, msg);
}

/**
 * Gives an item from 1 player to another.
 * @param {string} playerName The player who will recieve the item.
 * @param {object} gameObject The game object.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} msg The discord message object.
 */
function transfer(playerName, gameObject, rawInput, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 2 || dashAmount > 3)
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the names and quantity.\n`!give -<player name> -<item name> -<quantity: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[3] && (isNaN(parsedCommand[3]) || Number(parsedCommand[3]) <= 0))
        return error.error("The quantity should be a positive numeric value.", "`!give -<player name> -<item name> -<quantity: optional>`", msg);

    db.transferItem(playerName, parsedCommand[1], gameObject, parsedCommand[2], parsedCommand[3], msg, givenAmount => {
        msg.channel.send(`\`${parsedCommand[1]}\` was given \`${givenAmount}\` \`${parsedCommand[2]}\` by \`${playerName}\``);
    });
}

/**
 * Allows a player to change image shown when they perform the `!info` command.
 * @param {string} imageURL The imgur URL link.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function upload(imageURL, playerName, gameName, msg) {
    if (!ui.isImgurLink(imageURL)) return error.error("This command only accepts imgur links. Please note that the link should end with a `.png` or `.gif` extension.", null, msg);
    db.uploadImage(imageURL, playerName, gameName, msg);
}

/**
 * Allows a player to add notes to their journal.
 * @param {array} rawInput The raw user input split into an array.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function addNote(rawInput, playerName, gameName, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the entry-name and description.\n**WARNING: You cannot use a dash anywhere in your entry-name or description!**\nIt can only appear right before the name/description.\n`!drop -<entry name> -<description>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    db.getJournalEntries(playerName, gameName, msg, info => {
        if (info.length >= 25)
            return error.error("You journal is completely full!", "`!del-note <entry name>` to get rid of a few of them. You journal can only hold 25 entries at a time.", msg);

        db.addJournalEntry(parsedCommand[1], parsedCommand[2], playerName, gameName, msg);
    });
}

/**
 * Allows the player to remove a note from their journal
 * @param {array} rawInput The raw user input from split into an array.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function removeNote(rawInput, playerName, gameName, msg) {
    let entryName = ui.getName(rawInput);
    db.deleteJournalEntry(entryName, playerName, gameName, msg);
}

/**
 * Displays the player journal in a DM to the player.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function getJournal(playerName, gameName, msg) {
    db.getJournalEntries(playerName, gameName, msg, info => {
        display.displayJournal(info, playerName, msg);
    });
}

/**
 * Pay a player a certain amount of money.
 * @param {string} receiver The person who is receiving the money.
 * @param {int} amount The amount of money to give.
 * @param {string} playerName The player name who is giving the money.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function pay(receiver, amount, playerName, gameObject, msg) {
    if (!gameObject.players.includes(receiver))
        return error.error(`Could not find \`${receiver}\` in the list of players.`, "Player names are case sensitive. Try checking your spelling.", msg);

    db.payPlayer(receiver, amount, playerName, gameObject.game_title, msg);
}

/**
 * Give an item to a player.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function giveItem(rawInput, gameObject, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 2 || dashAmount > 3)
        return error.error("Incorrect command format.", "Don't forget the `-` before the inputs.\n`!give-item -<player name> -<item name> -<#: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    if (!isNaN(parsedCommand[2]))
        return error.error("What is the name of the item?", "Don't forget the `-` before the inputs.\n`!give-item -<player name> -<item name> -<#: optional>`", msg);
    if (parsedCommand[3] && isNaN(parsedCommand[3]))
        return error.error("The last input is a numeric value.", "Don't forget the `-` before the inputs.\n`!give-item -<player name> -<item name> -<#: optional>`", msg);

    db.giveItem(parsedCommand[1], gameObject, parsedCommand[2], Number(parsedCommand[3]), msg, amountGiven => {
        msg.channel.send(`Successfully gave ${parsedCommand[1]}, ${amountGiven} ${parsedCommand[2]}`);
    });
}

/**
 * Give a spell to a player.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function giveSpell(rawInput, gameObject, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("Incorrect command format.", "Don't forget the `-` before the inputs.\n`!give-spell -<player name> -<spell name>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    if (!isNaN(parsedCommand[2])) return error.error("What is the name of the spell?", "Don't forget the `-` before the inputs.\n`!give-spell -<player name> -<spell name>`", msg);

    db.giveSpell(parsedCommand[1], gameObject, parsedCommand[2], msg);
}

exports.drop = drop;
exports.equip = equip;
exports.transfer = transfer;
exports.upload = upload;
exports.addNote = addNote;
exports.removeNote = removeNote;
exports.getJournal = getJournal;
exports.pay = pay;
exports.giveItem = giveItem;
exports.giveSpell = giveSpell;
exports.adminRemoveItem = adminRemoveItem;
exports.adminRemoveSpell = adminRemoveSpell;
exports.adminEquip = adminEquip;
