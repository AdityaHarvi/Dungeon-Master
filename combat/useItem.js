const removeItem = require('../util/removeItem'),
    error = require('../util/error'),
    getInfo = require('../gameInfo/getInfo'),
    items = require('../inventories/items'),
    writeInfo = require('../gameInfo/writeInfo');

/**
 * Adjusts player stat points based off the equipment they are currently equiping.
 * @param {object} playerInfo The object containing player information.
 * @param {object} itemInfo The object containing item information.
 * @param {string} itemName The item name to be equiped.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function handleStats(playerInfo, itemInfo, itemName, msg) {
    playerInfo.items = removeItem.removeItem(playerInfo.items, itemName);
    playerInfo.strength = playerInfo.strength + itemInfo.str;

    playerInfo.health = playerInfo.health + itemInfo.hp;
    if (playerInfo.health > playerInfo.maxHealth) {
        playerInfo.health = playerInfo.maxHealth;
    }

    playerInfo.mana = playerInfo.mana + itemInfo.mana;
    if (playerInfo.mana > playerInfo.maxMana) {
        playerInfo.mana = playerInfo.maxMana;
    }

    if (itemInfo.addInventory) {
        playerInfo.maxInventory = Number(playerInfo.maxInventory) + Number(itemInfo.addInventory);
    }

    // Update player information.
    writeInfo.writeInfo(playerInfo, msg, function () {
        msg.reply(` has used a ${itemInfo.name}`);
    })
}

/**
 * Consumes an item from the players inventory.
 * @param {string} itemName The item to be consumed.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function useItem(itemName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(msg.member.nickname, msg, (playerInfo) => {
        let itemInfo = items.items[itemName];
        
        if (!itemInfo) {
            return error.error('Item does not exist. Check your spelling.', msg);
        } else if (!playerInfo.items.includes(itemName)) {
            return error.error('You do not have this item. Double check the spelling.', msg);
        } else if (!itemInfo.consumable) {
            return error.error('This item cannot be consumed.', msg);
        }

        handleStats(playerInfo, itemInfo, itemName, msg);
    });
}

exports.useItem = useItem;
