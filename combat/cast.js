const error = require('../util/error'),
    getInfo = require('../gameInfo/getInfo'),
    diceRoll = require('../util/diceRoll'),
    displayInfo = require('../gameInfo/displayInfo'),
    spells = require('../inventories/spells'),
    writeInfo = require('../gameInfo/writeInfo');

/**
 * Heals the target player with the amount specified on the spell.
 * @param {object} targetInfo The target information.
 * @param {object} playerInfo The player casting the spell's information.
 * @param {object} spellInfo The spell information.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function healTarget(targetInfo, playerInfo, spellInfo, msg, client, activateAbility) {
    if (Number(targetInfo.health) === 0) {
        return error.error(`${targetInfo.name} is dead. You need to revive them!`, msg);
    } else if (Number(spellInfo.mana) > Number(playerInfo.mana)) {
        return error.error('You do not have enough mana.', msg);
    }

    let originalSpell = spellInfo;

    if (playerInfo.abilities.includes('mana_recycling')) {
        spellInfo.mana = Math.round(Number(spellInfo.mana) / 2);
    }

    let extraInfo = {};
    playerInfo.mana = Number(playerInfo.mana) - Number(spellInfo.mana);

    if (activateAbility && activateAbility === 'prayer') {
        extraInfo.extraRoll = Number(diceRoll.diceRoll(10, msg));
        spellInfo.heal = Number(spellInfo.heal) + extraInfo.extraRoll;
        extraInfo.specialAbility2 = 'Prayer';
    }

    if (targetInfo.name !== playerInfo.name) { // If the player is targetting a different player.
        targetInfo.health = Number(targetInfo.health) + Number(spellInfo.heal);

        if (spellInfo.name === 'Overheal') {
            client.channels.cache.get('728412435131924482').send(`${targetInfo.name}'s old max HP was \`${targetInfo.maxHealth}\`, remember to reduce this by ${spellInfo.heal} after the battle.`);
            targetInfo.maxHealth = Number(targetInfo.maxHealth) + Number(spellInfo.heal);
        } else if (Number(targetInfo.health) > Number(targetInfo.maxHealth)) {
            targetInfo.health = Number(targetInfo.maxHealth);
        }

        extraInfo.target = targetInfo;
        writeInfo.writeInfo(playerInfo, msg, () => {
            writeInfo.writeInfo(targetInfo, msg, () => {
                spellInfo = originalSpell;
            });
        });
    } else { // If the player is targetting themself for the healing spell.
        playerInfo.health = Number(playerInfo.health) + Number(spellInfo.heal);

        if (spellInfo.name === 'Overheal') {
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name}'s old max HP was \`${targetInfo.maxHealth}\``);
            playerInfo.maxHealth = Number(playerInfo.maxHealth) + Number(spellInfo.heal);
        } else if (Number(playerInfo.health) > Number(playerInfo.maxHealth)) {
            playerInfo.health = Number(playerInfo.maxHealth);
        }

        extraInfo.target = playerInfo;
        writeInfo.writeInfo(playerInfo, msg, () => {
            spellInfo = originalSpell;
        });
    }
    
    displayInfo.displaySpellCast(playerInfo, spellInfo, extraInfo, msg);
}

/**
 * Gets information for who to cast the spell on.
 * @param {object} playerInfo The senders information.
 * @param {object} spellInfo The spell information
 * @param {string} target The name of the target.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function getTargetInformation(playerInfo, spellInfo, target, msg, client, activateAbility) {
    if (!target) return error.error('Who are you trying to heal? `!cast <spell> <target>` (only if its a healing spell!).', msg);

    // Read target information.
    getInfo.getPlayerInfo(target, msg, (targetInfo) => {
        healTarget(targetInfo, playerInfo, spellInfo, msg, client, activateAbility);
    });
}

/**
 * Reads spell information.
 * @param {string} spellName The name of the spell being cast.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {string} target The target for who to cast a spell on.
 * @param {stirng} playerName The name of the player, this is only used if you are force-casting for a player.
 */
function cast(spellName, msg, target, playerName, client, activateAbility) {
    let host = msg.member._roles.includes('727195200681934969'),
        name = msg.member.nickname,
        spellInfo = spells.spells[spellName];

    if (playerName && host) {
        name = playerName
    } else if (playerName) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (!spellInfo) {
        return error.error('Cannot find the spell you are looking for.', msg);
    } else if (isNaN(spellInfo.mana)) {
        return msg.channel.send('Since this does not have a set mana cost, just verbally tell what you want and the DM will deduct mana accordingly.');
    }

    // Read player information.
    getInfo.getPlayerInfo(name, msg, (playerInfo) => {
        if (playerInfo.abilities.includes('mana_recycling')) {
            spellInfo.mana = Math.floor(Number(spellInfo.mana) / 2);
        }

        // Error handling.
        if (!playerInfo.spells.includes(spellName)) { // Check if the player has learnt the spell.
            return error.error('You have not learnt this spell', msg);
        } else if (activateAbility && !playerInfo.abilities.includes(activateAbility + ' (A)')) {
            return error.error('You do not have that ability', msg);
        } else if (spellInfo.heal) { // Healing spells need to perform different actions from damage spells.
            return getTargetInformation(playerInfo, spellInfo, target, msg, client, activateAbility);
        }

        if (spellName === 'creation') {
            return msg.channel.send(`${playerInfo.name} has cast creation! Your mana will be deducted accordingly.`);
        }

        if (Number(playerInfo.mana) < Number(spellInfo.mana)) { // Check if the player has enough mana.
            return error.error('You do not have enough mana to cast this spell.', msg);
        } 

        // Modifies player mana and updates the player information.
        playerInfo.mana = Number(playerInfo.mana) - Number(spellInfo.mana);
        writeInfo.writeInfo(playerInfo, msg, () => {
            let extraInfo = {};

            if (spellInfo.damage) {
                extraInfo.damage = Number(spellInfo.damage);

                if (activateAbility && activateAbility === 'meditate') {
                    extraInfo.extraRoll = Number(diceRoll.diceRoll(10, msg));
                    extraInfo.damage += extraInfo.extraRoll;
                    extraInfo.specialAbility2 = 'Meditate';
                }

                if (spellInfo.diceSize) { // Special modifier for spells.
                    extraInfo.roll = Number(diceRoll.diceRoll(spellInfo.diceSize, msg));

                    if (playerInfo.abilities.includes('i_am_my_own_plus_1')) {
                        extraInfo.specialAbility = 'i_am_my_own_plus_1';
                        extraInfo.damage += 1;
                    }
                    
                    extraInfo.damage += extraInfo.roll;
                }
            }

            displayInfo.displaySpellCast(playerInfo, spellInfo, extraInfo, msg);
            spellInfo = spells.spells[spellName];
        });
    });
}

exports.cast = cast;
