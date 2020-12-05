const getInfo = require('./getInfo'),
    items = require('../inventories/items'),
    spells = require('../inventories/spells'),
    abilities = require('../inventories/abilities'),
    error = require('../util/error');

/**
 * This function replaces an empty array with keyword "None" to correct the empty-discord-embed issue. 
 * @param {array} objectToCheck The array to check if it is empty.
 */
function checkIfExists(objectToCheck) {
    return (objectToCheck.length === 0) ? "None" : objectToCheck;
}

/**
 * Populates the 'fields' parameter for the Embed.
 * @param {object} playerObj The object containing all the information for the player.
 */
function getFields(playerObj) {
    fields = [];
    fields[0] = {name: '|--------HEALTH--------|', value: `|‾‾‾‾‾‾‾( ${playerObj.health}/${playerObj.maxHealth} )‾‾‾‾‾‾‾‾‾|`, inline: true};
    fields[1] = {name: '|-------STRENGTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾‾( ${playerObj.strength} )‾‾‾‾‾‾‾‾‾‾‾‾|`, inline: true};
    fields[2] = {name: '|---------MANA---------|', value: `|‾‾‾‾‾‾‾‾‾( ${playerObj.mana}/${playerObj.maxMana} )‾‾‾‾‾‾‾‾|`, inline: true};
    fields[3] = {name: '\u200b', value: `**Equiped: ${playerObj.currentlyEquiped}**`};
    fields[4] = {name: '|---------SPELLS---------|', value: checkIfExists(playerObj.spells), inline: true};
    fields[5] = {name: `|------TOOLS (${playerObj.items.length}/${playerObj.maxInventory})------|`, value: checkIfExists(playerObj.items), inline: true};
    fields[6] = {name: '|-------ABILITIES--------|', value: checkIfExists(playerObj.abilities), inline: true};

    return fields;
}

/**
 * Displays the character information for the player requesting it.
 * @param {string} playerName The name of the player.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function displayPlayerInfo(playerName, msg) {
    if (playerName.toLowerCase() !== msg.member.nickname.toLowerCase() && !msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        const characterInformationEmbed = {
            color: 0xd8eb34,
            title: `${playerInfo.name}'s Inventory [${playerInfo.class}]`,
            fields: getFields(playerInfo)
        };

        return msg.author.send({embed: characterInformationEmbed});
    });
}

/**
 * Generates a custom embed.
 * @param {object} inventoryObject Contains information about the object.
 */
function getInventoryEmbed(inventoryObject) {
    return {
        color: inventoryObject.color,
        title: inventoryObject.name,
        thumbnail: {
            url: inventoryObject.image
        },
        fields: [
            {
                name: inventoryObject.header,
                value: inventoryObject.info
            }
        ]
    };
}

/**
 * Displays item information in an embed.
 * @param {string} itemName The name of the item.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displayItemInfo(itemName, msg) {
    if (!items.items[itemName]) return error.error('Item does not exist.', msg);

    let itemInfo = items.items[itemName];
    itemInfo.color = 0x7734eb;
    itemInfo.header = `${(itemInfo.equipable) ? 'Equipable' : 'Consumable'}`;
    const itemInfoEmbed = getInventoryEmbed(itemInfo);
    return msg.channel.send({embed: itemInfoEmbed});
}

/**
 * Displays spell information in an embed.
 * @param {string} spellName The name of the spell.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displaySpellInfo(spellName, msg) {
    if (!spells.spells[spellName]) return error.error('Spell does not exist.', msg);

    let spellInfo = spells.spells[spellName];
    spellInfo.color = 0x34ebab;
    spellInfo.header = `Mana Cost: ${spellInfo.mana}`;
    const spellInfoEmbed = getInventoryEmbed(spellInfo);
    return msg.channel.send({embed: spellInfoEmbed});
}

/**
 * Displays ability information in an embed.
 * @param {string} abilityName The name of the ability.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displayAbilityInfo(abilityName, msg) {
    if (!abilities.abilities[abilityName]) return error.error('Ability does not exist.', msg);

    let abilityInfo = abilities.abilities[abilityName];
    abilityInfo.color = 0xebae34;
    abilityInfo.header = 'Consumable Ability';

    if (abilityInfo.passive) {
        abilityInfo.header = 'Passive Ability';
    } else if (abilityInfo.activate) {
        abilityInfo.header = 'Activatable Ability';
    }

    const abilityInfoEmbed = getInventoryEmbed(abilityInfo);

    return msg.channel.send({embed: abilityInfoEmbed});
}

/**
 * Populates the fields for the jounal embed.
 * @param {object} playerInfo The player object.
 */
function getJournalFields(playerInfo) {
    let fields = [];

    // Base message that the player will see if they don't have any notes.
    if (playerInfo.journal.length === 0) {
        return fields[0] = {name: 'The pages got wet from the shipwreck and you can\'t make out any of the notes. At least future additions will be easier to read.', value: 'Do `!add-note <note title> <message>` to start writing in your journal!'};
    }

    for (var i = 0; i < playerInfo.journal.length; i++) {
        fields[i] = {name: playerInfo.journal[i].name, value: playerInfo.journal[i].message};
    }

    return fields;
}

/**
 * Displays the journal as a private message to the player.
 * @param {string} playerName Name of the player.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displayNote(playerName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        const journalEntryEmbed = {
            color: 0x32a8a4,
            title: `${playerInfo.name}'s Journal (${playerInfo.journal.length}/25)`,
            thumbnail: {
                url: 'https://i.imgur.com/XYraIdT.png'
            },
            fields: getJournalFields(playerInfo)
        };

        return msg.author.send({embed: journalEntryEmbed});
    });
}

function getSpellCastFields(playerInfo, spellInfo, extraInfo) {
    let fields = [];

    fields[0] = {name: `Remaining Mana: ${playerInfo.mana}`, value: `Spell Cost: ${spellInfo.mana}`};

    if (spellInfo.damage && spellInfo.diceSize) {
        fields[1] = {name: `Total Damage Dealt: \`${extraInfo.damage}\``, value: `${(extraInfo.extraRoll) ? `D10 (${extraInfo.extraRoll}) + ` : ''}D${spellInfo.diceSize} (${extraInfo.roll}) + ${spellInfo.damage} ${(extraInfo.specialAbility) ? '+ 1' : '' }`, inline: true};
    } else if (spellInfo.damage) {
        fields[1] = {name: `Total Damage Dealt: \`${spellInfo.damage}\``, value: `${(extraInfo.extraRoll) ? `D10 (${extraInfo.extraRoll}) + ` : '\u200b'}`};
    } else if (spellInfo.heal) {
        fields[1] = {name: `${playerInfo.name} healed ${extraInfo.target.name} for \`${spellInfo.heal}\` HP`, value: `${(extraInfo.extraRoll) ? `D10 Roll: ${extraInfo.extraRoll}` : '\u200b'}`, inline:true};
    }

    if (extraInfo.extraRoll) {
        fields[2] = {name: '\u200b', value: `Ability Activated: \`${extraInfo.specialAbility2}\``, inline: true};
    }

    return fields;
}

function displaySpellCast(playerInfo, spellInfo, extraInfo, msg) {
    const spellCastEmbed = {
        color: 0xfc03b1,
        title: `${playerInfo.name} cast's ${spellInfo.name}`,
        thumbnail: {
            url: spellInfo.image
        },
        fields: getSpellCastFields(playerInfo, spellInfo, extraInfo)
    };

    if (extraInfo.specialAbility) {
        spellCastEmbed.footer = { text: `Passive ability "${extraInfo.specialAbility}" has been activated.` }
    }

    return msg.channel.send({embed: spellCastEmbed});
}

function getAttackFields(playerInfo, extraInfo) {
    let fields = [];

    fields[0] = {name: `Total Damage Dealt: \`${extraInfo.damage}\``, value: `${(playerInfo.firstRoll) ? `D${playerInfo.diceSize} (${playerInfo.firstRoll}) + ` : ''}D${playerInfo.diceSize} (${extraInfo.roll}) + ${playerInfo.strength} ${(extraInfo.specialAbility) ? '+ 1 ' : '' }`, inline: true};
    if (playerInfo.specialAbility2) {
        fields[1] = {name: `\u200b`, value: `Ability Activated: \`${playerInfo.specialAbility2}\``, inline: true};
    }

    return fields;
}

function displayAttactInfo(playerInfo, itemInfo, extraInfo, msg) {
    const attackEmbed = {
        color: 0x995e06,
        title: `${playerInfo.name} attacks with ${itemInfo.name}`,
        thumbnail: {
            url: itemInfo.image
        },
        fields: getAttackFields(playerInfo, extraInfo)
    };

    if (extraInfo.specialAbility) {
        attackEmbed.footer = { text: `Passive ability "${extraInfo.specialAbility}" has been activated.` };
    }

    return msg.channel.send({embed: attackEmbed});
}

function displayDiceRoll(playerName, finalRoll, rollVal, diceSize, specialAbility, msg) {
    const diceRollEmbed = {
        color: 0xa8a632,
        title: `${playerName} rolls a \`${finalRoll}\``,
        thumbnail: {
            url: 'https://i.imgur.com/4EAe8y6.png'
        },
        fields: {name: `\u200b`, value: `D${diceSize} (${rollVal}) ${(specialAbility) ? ' + 1' : ''}`, inline: true}
    };

    if (specialAbility) {
        diceRollEmbed.footer = { text: `Passive ability "${specialAbility}" has been activated.` };
    }

    return msg.channel.send({embed: diceRollEmbed});
}

exports.displayPlayerInfo = displayPlayerInfo;
exports.displayAbilityInfo = displayAbilityInfo;
exports.displaySpellInfo = displaySpellInfo;
exports.displayItemInfo = displayItemInfo;
exports.displayNote = displayNote;
exports.displaySpellCast = displaySpellCast;
exports.displayAttactInfo = displayAttactInfo;
exports.displayDiceRoll = displayDiceRoll;
