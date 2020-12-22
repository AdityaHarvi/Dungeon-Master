const error = require('../util/error'),
    displayInfo = require('../displayInfo/displayInfo'),
    items = require('../inventories/items'),
    diceRoll = require('../util/dice');

/**
 * Changes the playerInfo obj and damage based on if the player used a special ability.
 * @param {string} risk The ability the player is using.
 * @param {object} playerInfo The player information object.
 * @param {number} damage The damage value.
 */
function handleStatIfAbility(risk, playerInfo, damage, msg) {
    if (risk === 'risky' && playerInfo.abilities.includes('risky (A)')) {
        playerInfo.strength = Number(playerInfo.strength) - 2;
        playerInfo.diceSize = 12;
        playerInfo.specialAbility2 = 'Risky';
    } else if (risk === 'super' && playerInfo.abilities.includes('super_risky (A)')) {
        playerInfo.strength = Number(playerInfo.strength) - 5;
        playerInfo.diceSize = 15;
        playerInfo.specialAbility2 = 'Super Risky';
    } else if (risk === 'ultra' && playerInfo.abilities.includes('ultra_risky (A)')) {
        playerInfo.strength = Number(playerInfo.strength) - 10;
        playerInfo.diceSize = 20;
        playerInfo.specialAbility2 = 'Ultra Risky';
    } else if (risk === 'double' && playerInfo.abilities.includes('double_damnage (A)')) {
        playerInfo.firstRoll = Number(diceRoll.diceRoll(playerInfo.diceSize, msg));
        playerInfo.specialAbility2 = 'Double Damnage';
        damage += playerInfo.firstRoll;
    }

    return {
        damage: damage,
        playerInfo: playerInfo
    }
}

/**
 * Rolls the dice and adds it to the strength of the player.
 * @param {string} risk If the player has a special ability, they can use it here.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function attack(playerName, risk, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        let itemInfo = items.items[playerInfo.currentlyEquiped.toLowerCase()],
            extraInfo = {},
            abilityModifier;

        extraInfo.damage = 0;

        if (risk && (risk === 'risky' || risk === 'super' || risk === 'ultra' || risk === 'double')) {
            abilityModifier = handleStatIfAbility(risk, playerInfo, extraInfo.damage, msg);
            playerInfo = abilityModifier.playerInfo;
            extraInfo.damage = Number(abilityModifier.damage);
        } else if (risk) {
            return error.error('You do not have this ability to use. Run `!attack` to proceed.', msg);
        }

        extraInfo.roll = Number(diceRoll.diceRoll(playerInfo.diceSize, msg));

        if (playerInfo.abilities.includes('i_am_my_own_plus_1')) {
            extraInfo.specialAbility = 'i_am_my_own_plus_1';
            extraInfo.damage += 1;
        }

        extraInfo.damage += Number(playerInfo.strength) + extraInfo.roll;

        displayInfo.displayAttactInfo(playerInfo, itemInfo, extraInfo, msg);
    });
}

exports.attack = attack;
