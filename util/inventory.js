const db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
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
    parsedCommand[1] = parsedCommand[1].replace(" ", "_");

    if (parsedCommand[2] && isNaN(parsedCommand[2])) {
        return error.error("The quantity should be a numeric value.", "`!drop -<item name> -<quantity: optional>`", msg);
    }

    db.dropItem(playerName, gameObject.game_title, parsedCommand[1], parsedCommand[2], msg);
}

exports.drop = drop;
exports.removeItem = removeItem;
exports.equip = equip;
