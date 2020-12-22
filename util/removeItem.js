const error = require('./error');

/**
 * Removes a single object from an array. This is needed because there can be
 * multiple of an object in an array.
 * @param {array} originalArray The array given.
 * @param {string} itemName The item to be removed from the array.
 */
function removeItem(originalArray, itemName) {
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
function dropItem(itemName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(msg.member.nickname, msg, (playerInfo) => {
        // Error handling.
        if (!playerInfo.items.includes(itemName)) {
            return error.error('You can only drop items. Check your spelling.', msg);
        } else if (playerInfo.currentlyEquiped === itemName) {
            return error.error('You cannot drop an item that is equiped.', msg);
        } else if (itemName === 'bare_fist') {
            return error.error('You cannot drop your bare hands.', msg);
        }

        // Removes the item and updates the player information.
        playerInfo.items = removeItem(playerInfo.items, itemName);
        writeInfo.writeInfo(playerInfo, msg, () => {
            msg.channel.send(`${playerInfo.name} has dropped ${itemName}.`);
        });
    });
}

exports.dropItem = dropItem;
exports.removeItem = removeItem;
