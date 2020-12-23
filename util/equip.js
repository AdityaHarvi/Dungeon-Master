const db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
    error = require("./error");

/**
 * Equip's a chosen item if the player has it in their inventory. Unequips the current item.
 * @param {string} playerName The name of the player.
 * @param {string} itemName Name of item to equip.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function equipItem(playerName, authorName, gameName, rawInput, msg) {
    if (playerName !== authorName && !ui.isHost) {
        return error.error("Only the host can equip an item for another player.", null, msg);
    }

    let itemName = ui.getName(rawInput);

    db.equipItem(playerName, gameName, itemName, msg);
}

exports.equipItem = equipItem;
