const items = require('../inventories/items'),
    error = require('./error');

/**
 * Determines the new stats for the player.
 * @param {object} playerObj The object containing the player information.
 * @param {string} oldItem The item being unequiped.
 * @param {object} newItem The item being equiped.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function handleStats(playerObj, oldItem, newItem, msg) {
    let oldItemInfo = items.items[oldItem];

    playerObj.maxHealth = Number(playerObj.maxHealth) - Number(oldItemInfo.hp) + Number(newItem.hp);
    playerObj.maxMana = Number(playerObj.maxMana) - Number(oldItemInfo.mana) + Number(newItem.mana);
    playerObj.strength = Number(playerObj.strength) - Number(oldItemInfo.str) + Number(newItem.str);

    if (playerObj.health > playerObj.maxHealth) {
        playerObj.health = playerObj.maxHealth;
    }
    if (playerObj.mana > playerObj.maxMana) {
        playerObj.mana = playerObj.maxMana;
    }

    writeInfo.writeInfo(playerObj, msg);
}

/**
 * Equip's a chosen item if the player has it in their inventory. Unequips the current item.
 * @param {string} playerName The name of the player.
 * @param {string} itemName Name of item to equip.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function equipItem(playerName, itemName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        let itemInfo = items.items[itemName];
        if (!itemInfo) {
            return error.error('The item does not exist. Check your spelling.', msg);
        } else if (!playerInfo.items.includes(itemName)) {
            return error.error('You do not have this item. Double check the spelling.', msg);
        } else if (!itemInfo.equipable) {
            return error.error('This item cannot be equiped.', msg);
        }

        let oldItem = playerInfo.currentlyEquiped;
            playerInfo.currentlyEquiped = itemName;

        handleStats(playerInfo, oldItem.toLowerCase(), itemInfo, msg);

        msg.channel.send(`${playerInfo.name} equiped '${itemInfo.name}' and unequiped '${oldItem}.'`);
    });
}

exports.equipItem = equipItem;
