const fs = require('fs'),
    abilities = require('../inventories/abilities'),
    error = require('../util/error'),
    getInfo = require('../gameInfo/getInfo'),
    writeInfo = require('../gameInfo/writeInfo'),
    removeItem = require('../util/removeItem');

/**
 * Special case where salvation is used. Heals whole party for the requested amount.
 * @param {number} healingAmount
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function salvation(healingAmount, msg) {
    // Read the names of all players in the game.
    fs.readdir('playerInfo', (err, files) => {
        if (err) return error.error('Failed to read player information folder.', msg);

        files.forEach((file) => {
            let partyPlayerName = file.split('.')[0];
            getInfo.getPlayerInfo(partyPlayerName, msg, (playerInfo) => {
                if (Number(playerInfo.health === 0)) return;

                playerInfo.health = Number(playerInfo.health) + Number(healingAmount);
                if (Number(playerInfo.health) > Number(playerInfo.maxHealth)) playerInfo.health = playerInfo.maxHealth;

                writeInfo.writeInfo(playerInfo, msg);
            });
        });
    });
}

/**
 * Activates an ability.
 * @param {string} playerName The name of the player.
 * @param {string} abilityName The name of the ability.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function activatePower(playerName, abilityName, msg) {
    if (playerName !== msg.member.nickname && !msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        // Special condition abilities.
        if ((abilityName === 'risky' || abilityName === 'super_risky' || abilityName === 'ultra_risky' || abilityName === 'double_damnage') && playerInfo.abilities.includes(`${abilityName} (A)`)) {
            return msg.channel.send('To use this ability, do `!attack <risky/super/ultra/double>`.');
        } else if (abilityName === 'meditate') {
            return msg.channel.send('To use this ability, do `!cast <spell> meditate`.');
        } else if (abilityName === 'prayer') {
            return msg.channel.send('To use this ability, do `!cast <spell> <target> prayer`.');
        }

        let abilityInfo = abilities.abilities[abilityName],
            fullAbilityName = '',
            modifyArray = false;

        if (!abilityInfo) return error.error('Cannot find the ability. Check your spelling.', msg);

        if (abilityInfo.passive) {
            return msg.channel.send('This is a passive ability, it is automatically active.');
        } else if (abilityInfo.activate) {
            fullAbilityName = abilityName + ' (A)';
        } else {
            fullAbilityName = abilityName + ' (C)';
            modifyArray = true;
        }

        if (!playerInfo.abilities.includes(fullAbilityName)) {
            return error.error('You do not have this ability to use!', msg);
        }

        // If a consumable ability is used, then it must be removed from their inventory.
        if (modifyArray) {
            playerInfo.abilities = removeItem.removeItem(playerInfo.abilities, fullAbilityName);
            writeInfo.writeInfo(playerInfo, msg, () => {
                if (abilityName === 'salvation') {
                    salvation(abilityInfo.hp, msg);
                    displayActivatedAbility(playerInfo.name, abilityInfo, msg);
                    msg.channel.send('Please wait 5 seconds before entering any futher commands.');
                }
            });
        }

        displayActivatedAbility(playerInfo.name, abilityInfo, msg);
    });
}

/**
 * Displays what the user activated into an embed.
 * @param {string} playerName The name of the player. 
 * @param {object} abilityInfo The ability object. 
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function displayActivatedAbility(playerName, abilityInfo, msg) {
    const abilityEmbed = {
        color: 0xfc7b03,
        title: `${playerName} activated ${abilityInfo.name}`,
        thumbnail: { url: `${abilityInfo.image}` },
        fields: { name: '\u200b', value: `${abilityInfo.info}` },
        footer: { text: 'You cannot use another ability until the effects of this have worn off.' }
    };

    return msg.channel.send({embed: abilityEmbed});
}

exports.activatePower = activatePower;
