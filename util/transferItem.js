const fs = require('fs'),
    error = require('./error'),
    remove = require('./removeItem'),
    getInfo = require('../gameInfo/getInfo'),
    items = require('../inventories/items'),
    writeInfo = require('../gameInfo/writeInfo');

/**
 * Gives an item from 1 player to another.
 * @param {string} playerName The player who will recieve the item.
 * @param {string} itemName The name of the item.
 * @param {string} msg The original command sent by the player.
 */
function transferItem(playerName, itemName, msg) {
    if (!fs.existsSync(`playerInfo/${playerName}.json`)) {
        return error.error('The player you are giving your item to cannot be found. Check your spelling', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(msg.member.nickname, msg, (playerInfo) => {
        // Error handling to ensure that the player is giving a proper item.
        if (itemName === 'bare_fist') {
            return error.error('You cannot give your hands to someone else.', msg);
        } else if (playerInfo.spells.includes(itemName) || playerInfo.abilities.includes(itemName)) {
            return error.error('You can only give an item to another player.', msg);
        } else if (!playerInfo.items.includes(itemName)) {
            return error.error('You do not have this item to give.', msg);
        } else if (playerInfo.currentlyEquiped === itemName) {
            return error.error('You need to unequip this before sending it to another player.', msg);
        }

        // Read player information.
        getInfo.getPlayerInfo(playerName, msg, (targetInfo) => {
            if (targetInfo.items.length >= Number(targetInfo.maxInventory)) {
                return msg.channel.send(`${targetInfo.name} does not have enough inventory space.`);
            }

            let itemInfo = items.items[itemName];
            if (!itemInfo) return error.error('The item does not exist. Check your spelling.', msg);

            if (targetInfo.items.includes(itemName) && itemInfo.equipable) {
                return error.error('The reciever already has this item.', msg);
            }
    
            // Remove item from sender and give to reciever.
            playerInfo.items = remove.removeItem(playerInfo.items, itemName);
            targetInfo.items.push(itemName);

            // Sort the arrays.
            playerInfo.items.sort();
            targetInfo.items.sort();

            // Saves the information into their profile files.
            writeInfo.writeInfo(playerInfo, msg);
            writeInfo.writeInfo(targetInfo, msg);
    
            return msg.reply(` has sent a ${itemName} to ${targetInfo.name}`);
        });
    });
}

exports.transferItem = transferItem;
