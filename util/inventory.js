const db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
    display = require("../displayInfo/displayInfo"),
    error = require("./error");

/**
 * Equip's a chosen item if the player has it in their inventory. Unequips the current item.
 * @param {string} playerName The name of the player.
 * @param {string} itemName Name of item to equip.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function equip(playerName, authorName, gameObject, rawInput, msg) {
    if (playerName !== authorName && !ui.isHost(authorName, gameObject.host)) {
        return error.error("Only the host can equip an item for another player.", null, msg);
    }

    let itemName = ui.getName(rawInput);

    db.equipItem(playerName, gameObject.game_title, itemName, msg);
}

/**
 * Removes a single object from an array. This is needed because there can be
 * multiple of an object in an array.
 * @param {array} originalArray The array given.
 * @param {string} itemName The item to be removed from the array.
 */
function removeItem(originalArray, itemName) {
    //FIXME MAYBE REMOVE THIS METHOD.
    let adjustedArray = [],
        flag = true;

    for (var i = 0; i < originalArray.length; i++) {
        if (originalArray[i] === itemName && flag) {
            flag = false;
        } else {
            adjustedArray.push(originalArray[i]);
        }
    }

    return adjustedArray;
}

/**
 * Drops and item from the player inventory.
 * @param {string} itemName The name of the item to drop.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function drop(playerName, authorName, gameObject, rawInput, msg) {
    if (playerName !== authorName && !ui.isHost(authorName, gameObject.host)) {
        return error.error("Only the host can remove an item from another player.", null, msg);
    }

    let testForDash = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            testForDash++;
        }
    });
    if (testForDash < 1) {
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the name and quantity.\n`!drop -<item name> -<quantity: optional>`", msg);
    }

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[2] && isNaN(parsedCommand[2]) && Number(parsedCommand[2]) > 0) {
        return error.error("The second input should be a positive numeric value.", "`!drop -<item name> -<quantity: optional>`", msg);
    }

    db.dropItem(playerName, gameObject.game_title, parsedCommand[1], parsedCommand[2], msg, droppedAmount => {
        msg.channel.send(`\`${playerName}\` dropped \`${droppedAmount}\` \`${parsedCommand[1]}\`.`);
    });
}

/**
 * Gives an item from 1 player to another.
 * @param {string} playerName The player who will recieve the item.
 * @param {string} itemName The name of the item.
 * @param {string} msg The original command sent by the player.
 */
function transfer(playerName, gameObject, rawInput, msg) {
    let testForDash = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            testForDash++;
        }
    });
    if (testForDash < 2) {
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the names and quantity.\n`!give -<player name> -<item name> -<quantity: optional>`", msg);
    }

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[3] && isNaN(parsedCommand[3]) && Number(parsedCommand[3]) > 0) {
        return error.error("The quantity should be a positive numeric value.", "`!give -<player name> -<item name> -<quantity: optional>`", msg);
    }

    db.transferItem(playerName, parsedCommand[1], gameObject, parsedCommand[2], parsedCommand[3], msg, givenAmount => {
        msg.channel.send(`\`${parsedCommand[1]}\` was given \`${givenAmount}\` \`${parsedCommand[2]}\` by \`${playerName}\``);
    });
}

function upload(imageURL, playerName, gameName, msg) {
    let pattern = /^https:\/\/(i.)?imgur.com\/\w{7}.(png|gif)$/;

    if (!pattern.test(imageURL)) return error.error("This command only accepts imgur links. Please note that the link should end with a `.png` or `.gif` extension.", null, msg);

    db.uploadImage(imageURL, playerName, gameName, msg);
}

function addNote(rawInput, playerName, gameName, msg) {
    let testForDash = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            testForDash++;
        }
    });
    if (testForDash !== 2) {
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the entry-name and description.\n**WARNING: You cannot use a dash anywhere in your entry-name or description!**\nIt can only appear right before the name/description.\n`!drop -<entry name> -<description>`", msg);
    }

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    db.getJournalEntries(playerName, gameName, msg, info => {
        if (info.length >= 25) {
            return error.error("You journal is completely full!", "`!del-note <entry name>` to get rid of a few of them. You journal can only hold 25 entries at a time.", msg);
        }
        db.addJournalEntry(parsedCommand[1], parsedCommand[2], playerName, gameName, msg);
    });
}

function removeNote(rawInput, playerName, gameName, msg) {
    let entryName = ui.getName(rawInput);
    db.deleteJournalEntry(entryName, playerName, gameName, msg);
}

function getJournal(playerName, gameName, msg) {
    db.getJournalEntries(playerName, gameName, msg, info => {
        display.displayJournal(info, playerName, msg);
    });
}

function pay(receiver, amount, playerName, gameObject, msg) {
    if (!gameObject.players.includes(receiver)) {
        return error.error(`Could not find \`${receiver}\` in the list of players.`, "Player names are case sensitive. Try checking your spelling.", msg);
    }

    db.payPlayer(receiver, amount, playerName, gameObject.game_title, msg);
}

exports.drop = drop;
exports.removeItem = removeItem;
exports.equip = equip;
exports.transfer = transfer;
exports.upload = upload;
exports.addNote = addNote;
exports.removeNote = removeNote;
exports.getJournal = getJournal;
exports.pay = pay;
