const error = require('../util/error');

/**
 * Adjusts the health of a player by the requested amount.
 * @param {string} playerName Name of the player.
 * @param {number} num The amount that must be adjusted.
 * @param {boolean} heal Whether to add or remove HP.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The discord client.
 */
function modifyHealth(playerName, num, heal, msg, client) {
    if (!msg.member._roles.includes('727195200681934969')) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (isNaN(num)) {
        return error.error('Your second input needs to be a number. Do !admin for help.', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        let sentenceVerb;
        if (!heal) { // If the host is damaging the player.
            playerInfo.health = Number(playerInfo.health) - Number(num);
            sentenceVerb = 'lost';
        } else { // If the host is healing the player.
            playerInfo.health = Number(playerInfo.health) + Number(num);
            sentenceVerb = 'gained';
        }

        if (playerInfo.health < 0) {
            playerInfo.health = 0;
        } else if (playerInfo.health > playerInfo.maxHealth) {
            playerInfo.health = playerInfo.maxHealth;
        }

        // Update character profile.
        writeInfo.writeInfo(playerInfo, msg, () => {
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name} has ${sentenceVerb} ${num} HP!`);
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name} has ${playerInfo.health}/${playerInfo.maxHealth} HP`);
            if (Number(playerInfo.health) === 0) {
                displayDeath(playerInfo, client);
            }
        });
    });
}

/**
 * Displays the death of a player in a nice format.
 * @param {object} playerInfo The player object.
 * @param {object} client The discord client.
 */
function displayDeath(playerInfo, client) {
    const deathEmbed = {
        color: 0x03fca5,
        title: `${playerInfo.name} has died`,
        thumbnail: { url: (playerInfo.image) ? playerInfo.image : 'https://i.imgur.com/0QUsQXV.png' },
        fields: { name: '\u200b', value: 'Your time has run out' }
    };

    return client.channels.cache.get('728382833688838187').send({embed: deathEmbed});
}

/**
 * Adjusts the mana of a player by the requested amount.
 * @param {string} playerName Name of the player.
 * @param {number} num The amount that must be adjusted.
 * @param {boolean} heal Whether to add or remove MP.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The dicosrd client.
 */
function modifyMana(playerName, num, heal, msg, client) {
    if (!msg.member._roles.includes('727195200681934969')) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (isNaN(num)) {
        return error.error('Your second input needs to be a number. Do !admin for help.', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        let sentenceVerb;
        if (!heal) { // If the host is reducing mana.
            playerInfo.mana = Number(playerInfo.mana) - Number(num);
            sentenceVerb = 'lost';
        } else { // If the host is giving mana.
            playerInfo.mana = Number(playerInfo.mana) + Number(num);
            sentenceVerb = 'gained';
        }

        if (playerInfo.mana < 0) {
            playerInfo.mana = 0;
        } else if (playerInfo.mana > playerInfo.maxMana) {
            playerInfo.mana = playerInfo.maxMana;
        }

        // Updates character information.
        writeInfo.writeInfo(playerInfo, msg, () => {
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name} has ${sentenceVerb} ${num} MP!`);
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name} has ${playerInfo.mana}/${playerInfo.maxMana} MP.`);
        });
    });
}

/**
 * Sets the max stats for the player.
 * @param {string} statToAdjust The stat to adjust.
 * @param {string} playerName The name of the player.
 * @param {number} amountToAdjust The amount to adjust the stats by.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {object} client The discord client.
 */
function modifyMaxStats(statToAdjust, playerName, amountToAdjust, msg, client) {
    if (!msg.member._roles.includes('727195200681934969')) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (statToAdjust !== 'hp' && statToAdjust !== 'mp' && statToAdjust !== 'str') {
        return error.error('Incorrect input. Adjusted stat must be <hp> <mp> OR <str>. Do !admin for help.', msg);
    } else if (isNaN(amountToAdjust)) {
        return error.error('Your 3rd input needs to be a number. Do !admin for help.', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        if (statToAdjust === 'hp') {
            playerInfo.maxHealth = Number(amountToAdjust);
            if (Number(playerInfo.health) > Number(playerInfo.maxHealth)) {
                playerInfo.health = playerInfo.maxHealth;
            }
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name}'s max HP has changed. Do \`!info\`.`);
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name} has ${playerInfo.health}/${playerInfo.maxHealth} HP.`);
        } else if (statToAdjust === 'mp') {
            playerInfo.maxMana = Number(amountToAdjust);
            if (Number(playerInfo.mana) > Number(playerInfo.maxMana)) {
                playerInfo.mana = playerInfo.maxMana;
            }
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name}'s max MP has changed. Do \`!info\`.`);
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name} has ${playerInfo.mana}/${playerInfo.maxMana} MP.`);
        } else {
            playerInfo.strength = Number(amountToAdjust);
            client.channels.cache.get('728382833688838187').send(`${playerInfo.name}'s strength has changed. Do \`!info\`.`);
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name}'s new str is now ${playerInfo.strength}.`);            
        }

        // Update character profile.
        writeInfo.writeInfo(playerInfo, msg);
    });
}

function modifyMaxInventory(amountToAdjust, playerName, increase, msg) {
    if (!msg.member._roles.includes('727195200681934969')) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (isNaN(amountToAdjust)) {
        return error.error('Your first input needs to be a number', msg);
    }

    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        if (!increase) {
            if (playerInfo.items.length > (Number(playerInfo.maxInventory) - Number(amountToAdjust))) {
                playerInfo.maxInventory = Number(playerInfo.maxInventory) - playerInfo.items.length;
            } else {
                playerInfo.maxInventory = Number(playerInfo.maxInventory) - Number(amountToAdjust);
            }

            writeInfo.writeInfo(playerInfo, msg, () => {
                msg.channel.send(`${playerInfo.name} has lost \`${amountToAdjust}\` inventory space.`);
            });
        } else {
            playerInfo.maxInventory = Number(playerInfo.maxInventory) + Number(amountToAdjust);
            writeInfo.writeInfo(playerInfo, msg, () => {
                msg.channel.send(`${playerInfo.name} has gained \`${amountToAdjust}\` inventory space.`);
            });
        }
    });
}

exports.modifyMaxStats = modifyMaxStats;
exports.modifyMana = modifyMana;
exports.modifyHealth = modifyHealth;
exports.modifyMaxInventory = modifyMaxInventory;
