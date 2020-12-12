const error = require('../util/error'),
    getInfo = require('../gameInfo/getInfo'),
    removeItem = require('../util/removeItem'),
    writeInfo = require('../gameInfo/writeInfo');

/**
 * Corrects syntax to allow for easy addition to the player information object.
 * @param {string} classOfObj spell/item/ability.
 */
function correctSyntax(classOfObj) {
    switch(classOfObj) {
        case 'spell':
            return classOfObj = 'spells';
        case 'item':
            return classOfObj = 'items';
        default:
            return classOfObj = 'abilities';
    }
}

/**
 * Checks if the player already has the ability.
 * @param {object} itemInfo The object containing ability information.
 * @param {object} playerInfo The object containing player information.
 */
function checkIfPlayerHasAbility(itemInfo, playerInfo) {
    if (itemInfo.activate) {
        return playerInfo.abilities.includes(`${itemInfo.name.toLowerCase()} (A)`);
    } else if (itemInfo.consumable) {
        return playerInfo.abilities.includes(`${itemInfo.name.toLowerCase()} (C)`);
    } else {
        return playerInfo.abilities.includes(itemInfo.name.toLowerCase());
    }
}

/**
 * If a passive ability is given/removed to a player, the stats must be modified.
 * @param {object} itemInfo The object containing item information.
 * @param {object} playerInfo The object containing player information.
 * @param {boolean} removing A flag to see whether to subtract/add stats.
 */
function handleAbilityStatModification(itemInfo, playerInfo, removing) {
    if (removing) {
        playerInfo.health = Number(playerInfo.health) - Number(itemInfo.hp);
        playerInfo.maxHealth = Number(playerInfo.maxHealth) - Number(itemInfo.hp);
    
        playerInfo.strength = Number(playerInfo.strength) - Number(itemInfo.str);
    
        playerInfo.mana = Number(playerInfo.mana) - Number(itemInfo.mana);
        playerInfo.maxMana = Number(playerInfo.maxMana) - Number(itemInfo.mana);

        if (itemInfo.diceSize) playerInfo.diceSize = 10;
    } else {
        playerInfo.health = Number(playerInfo.health) + Number(itemInfo.hp);
        playerInfo.maxHealth = Number(playerInfo.maxHealth) + Number(itemInfo.hp);
    
        playerInfo.strength = Number(playerInfo.strength) + Number(itemInfo.str);
    
        playerInfo.mana = Number(playerInfo.mana) + Number(itemInfo.mana);
        playerInfo.maxMana = Number(playerInfo.maxMana) + Number(itemInfo.mana);

        if (itemInfo.diceSize) playerInfo.diceSize = itemInfo.diceSize;
    }

    if (Number(playerInfo.health) < 0) {
        playerInfo.health = 0;
        if (Number(playerInfo.maxHealth) < 0) {
            playerInfo.maxHealth = 0;
        }
    }

    if (Number(playerInfo.mana) < 0) {
        playerInfo.mana = 0;
        if (Number(playerInfo.maxMana) < 0) {
            playerInfo.maxMana = 0;
        }
    }

    if (Number(playerInfo.strength) < 0) {
        playerInfo.strength = 0;
    }

    return playerInfo;
}

/**
 * Appends the items to the array.
 * @param {object} playerInfo The player Information
 * @param {string} correctedClass The name of the corrected class of object.
 * @param {string} objectToGive The object to give.
 * @param {number} numberOfItems The number of items you want to add. Defaults to 1 if no input.
 * @param {object} itemInfo Item information.
 * @param {object} playerInfo The object containing player information.
 */
function pushToArray(playerInfo, correctedClass, objectToGive, numberOfItems, itemInfo, msg) {
    let openInventory = Number(playerInfo.maxInventory) - playerInfo.items.length;

    if (correctedClass !== 'items' || itemInfo.equipable) {
        numberOfItems = 1;
    } else if (correctedClass === 'items' && numberOfItems > openInventory) {
        msg.channel.send(`Player inventory is full so I only added ${openInventory} item(s).`);
        numberOfItems = openInventory;
    }

    for (let i = 0; i < numberOfItems; i++) {
        playerInfo[correctedClass].push(objectToGive);
    }

    return playerInfo[correctedClass];
}

/**
 * Reads the item information and prints out the final message.
 * @param {string} objectToGive The object to give.
 * @param {object} playerInfo The player info object.
 * @param {string} correctedClass The adjusted syntax.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The discord client.
 * @param {string} classOfObj The class of the object (spell/item/ability).
 * @param {number} numberOfItems The number of items you want to add. Defaults to 1 if no input.
 */
function getObjectInfo(objectToGive, playerInfo, correctedClass, msg, client, classOfObj, numberOfItems) {
    let inventoryObj = require(`../inventories/${correctedClass}`),
        itemInfo = inventoryObj[correctedClass][objectToGive],
        ownedObj = playerInfo[correctedClass].includes(objectToGive);

    if (!numberOfItems) {
        numberOfItems = 1;
    }

    // Error handling.
    if (!itemInfo) {
        return error.error('The item does not exist. Check your spelling', msg);
    } else if (ownedObj && itemInfo.equipable) {
        return error.error('The player already has this item. You cannot give multiple of the same equipable item to the same player.', msg);
    } else if (correctedClass === 'abilities' && checkIfPlayerHasAbility(itemInfo, playerInfo)) {
        return error.error(`${playerInfo.name} has already learnt this ability`, msg);
    } else if (ownedObj && correctedClass === 'spells') {
        return error.error(`${playerInfo.name} has already learnt this spell.`, msg);
    }

    // Adds the ability to the character.
    if (correctedClass === 'abilities' && itemInfo.activate) {
        playerInfo[correctedClass].push(objectToGive + ' (A)');
    } else if (correctedClass === 'abilities' && itemInfo.consumable) {
        playerInfo[correctedClass].push(objectToGive + ' (C)');
    } else if (correctedClass === 'abilities') { // Passive abilities must change the stats when added.
        playerInfo[correctedClass].push(objectToGive);
        playerInfo = handleAbilityStatModification(itemInfo, playerInfo);
    } else {
        playerInfo[correctedClass] = pushToArray(playerInfo, correctedClass, objectToGive, numberOfItems, itemInfo, msg);
    }

    playerInfo[correctedClass].sort();

    return writeInfo.writeInfo(playerInfo, msg, () => {
        client.channels.cache.get('728382833688838187').send(`${playerInfo.name} just got a ${classOfObj}... do \`!info\` to see whatcha got!`);
        msg.channel.send(`${playerInfo.name} recieved the item(s).`);
    });
}

/**
 * Gives a player a spell/item/ability based off the Dungeon Masters input. Host only command.
 * @param {string} playerName The name of the player.
 * @param {string} classOfObj The type of object to give (spell/item/ability).
 * @param {string} objectToGive The spell/item/ability to be given.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The discord client.
 * @param {number} numberOfItems The number of items you want to add. Defaults to 1 if no input.
 */
function addObject(playerName, classOfObj, objectToGive, msg, client, numberOfItems) {
    let host = msg.member._roles.includes('727195200681934969');
    
    // Error handling.
    if (!host) {
        return error.error('You need to have a special rank in order to run this command.', msg);
    } else if (classOfObj !== "spell" && classOfObj !== "ability" && classOfObj !== "item") {
        return error.error('You have entered in an incorrect value to give. Only acceptable classes are <spell>, <ability>, and <item>', msg);
    } else if (numberOfItems && isNaN(numberOfItems)) {
        return error.error('Your last entry needs to be a number', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        if (playerInfo.items.length >= Number(playerInfo.maxInventory) && classOfObj === 'item') {
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name} does not have enough inventory space.`);
            return msg.channel.send(`${playerInfo.name} does not have enough inventory space.`);
        }

        getObjectInfo(objectToGive, playerInfo, correctSyntax(classOfObj), msg, client, classOfObj, numberOfItems);
    });
}

/**
 * Removes the ability from the player inventory.
 * @param {object} playerInfo Player object.
 * @param {string} abilityName Name of the ability.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {object} client The discord client.
 */
function removeAbility(playerInfo, abilityName, msg, client) {
    let abilityInfo = abilities.abilities[abilityName];
    if (!abilityInfo) return error.error('The ability does not exist. Check your spelling.', msg);

    let correctedAbility = '';
    if (abilityInfo.activate) {
        correctedAbility = abilityName + ' (A)';
    } else if (abilityInfo.consumable) {
        correctedAbility = abilityName + ' (C)';
    } else {
        correctedAbility = abilityName;
    }

    if (!playerInfo.abilities.includes(correctedAbility)) return error.error('The player does not have this ability.', msg);

    if (abilityInfo.passive) {
        playerInfo = handleAbilityStatModification(abilityInfo, playerInfo, true);
    }

    // Remove ability from the player inventory and change the stats.
    playerInfo.abilities = removeItem.removeItem(playerInfo.abilities, correctedAbility);

    // Update player information.
    writeInfo.writeInfo(playerInfo, msg, () => {
        client.channels.cache.get('728382833688838187').send(`${playerInfo.name} just lost an ability... do \`!info\` to see what changed.`);
        msg.channel.send(`${playerInfo.name} just lost ${abilityName}.`);
    });
}

/**
 * Gives a player a spell/item/ability based off the Dungeon Masters input. Host only command.
 * @param {string} playerName The name of the player.
 * @param {string} classOfObj The type of object to give (spell/item/ability).
 * @param {string} objName The spell/item/ability to be taken.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The discord client.
 */
function removeObject(playerName, classOfObj, objName, msg, client) {
    let host = msg.member._roles.includes('727195200681934969');
    
    // Error handling.
    if (!host) {
        return error.error('You need to have a special rank in order to run this command.', msg);
    } else if (classOfObj !== "spell" && classOfObj !== "ability" && classOfObj !== "item") {
        return error.error('You have entered in an incorrect second input. Only acceptable entries are <spell>, <ability>, and <item>', msg);
    }

    let correctedClass = correctSyntax(classOfObj);

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        let ownedObj = playerInfo[correctedClass].includes(objName);

        if (!ownedObj && correctedClass !== 'abilities') {
            return error.error('The player does not have this.', msg);
        } else if (objName === 'bare_fist') {
            return error.error('This item cannot be removed from any player.', msg);
        } else if (playerInfo.currentlyEquiped === objName) {
            return error.error(`They currently have the item equiped. Copy/paste this: \`!admin-equip ${playerInfo.name} bare_fist\` then re-run the command.`, msg);
        }

        // Handles ability removing.
        if (correctedClass === 'abilities') {
            return removeAbility(playerInfo, objName, msg, client);
        }

        playerInfo[correctedClass] = removeItem.removeItem(playerInfo[correctedClass], objName);

        // Update player information.
        writeInfo.writeInfo(playerInfo, msg, () => {
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name} just lost a ${classOfObj} from their inventory... do \`!info\` to see what changed.`);
            msg.channel.send(`${playerInfo.name} just lost ${objName}.`);
        });
    });
}

exports.removeObject = removeObject;
exports.addObject = addObject;
