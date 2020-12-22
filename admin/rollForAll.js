const fs = require('fs'),
    diceRoll = require('../util/dice'),
    error = require('../util/error');

/**
 * Sorts a given array in decending order.
 * @param {array} arr The given array.
 */
function sortArray(arr) {
    return arr.sort((a, b) => parseFloat(b.roll) - parseFloat(a.roll));
}

/**
 * Populates the fields for the embed.
 * @param {array} sortedArray The given array.
 */
function getFields(sortedArray) {
    let fields = [];

    for (let i = 0; i < sortedArray.length; i++) {
        fields[i] = {name: `${sortedArray[i].name}: \`${sortedArray[i].roll}\``, 
                    value: `${(i + 1 < sortedArray.length) ? `**${sortedArray[i + 1].name}: \`${sortedArray[i + 1].roll}\`**` : '\u200b'}`};
        i++;
    }

    return fields;
}

/**
 * Creates the embed to display.
 * @param {array} sortedArray The sorted array.
 * @param {number} diceSize The size of the dice.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displaySortedRolls(sortedArray, diceSize, msg) {
    const displayInitEmbed = {
        color: 0x03fca5,
        author: { name: `--( Order of turns )--` },
        title: `Rolling with D${diceSize}`,
        thumbnail: { url: 'https://i.imgur.com/fEVNr1J.png' },
        fields: getFields(sortedArray),
        footer: { text: 'All passive abilities are accounted for.' }
    };

    return msg.channel.send({embed: displayInitEmbed});
}

/**
 * Rolls the dice for all players.
 * @param {number} val The size of the dice. Defaults to 20 if no input is given.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {number} numOfEnemies The number of enemies to roll the dice for.
 */
function rollForPlayers(val, msg, numOfEnemies) {
    if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    // Check if they input a dice size.
    let diceSize = val,
        playerRolls = [];
    if (!val) diceSize = 20;

    if (numOfEnemies) {
        playerRolls = rollForEnmies(numOfEnemies, val, msg);
    }

    // Read the names of all players in the game.
    fs.readdir('playerInfo', (err, files) => {
        if (err) return error.error('Failed to read player information folder.', msg);

        let numOfPlayers = files.length,
            playerCounter = 0;

        // Prints out the roll for each player.
        files.forEach((file) => {
            let playerName = file.split('.')[0],
                playerObj = {},
                roll = 0;

            // Get player information.
            getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
                // Only roll if the player is alive.
                if (Number(playerInfo.health) !== 0 && playerInfo.name !== msg.member.nickname) {
                    if (playerInfo.abilities.includes('i_am_my_own_plus_1')) roll += 1;

                    roll += Number(diceRoll.diceRoll(diceSize, msg));
                    playerObj.name = playerInfo.name;
                    playerObj.roll = roll;
                    playerRolls.push(playerObj);
                }

                playerCounter++;

                if (playerCounter === numOfPlayers) { // Once all player rolls are accounted for, then sort and display the rolls.
                    displaySortedRolls(sortArray(playerRolls), diceSize, msg);
                }
            });
        });
    });
}

/**
 * Rolls the dice for a requested # of enemies.
 * @param {number} numOfEnemies The number of enemies.
 * @param {number} val The size of the dice. Defaults to 20 if no input.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {boolean} trueRoll Whether the user wants the only see the rolls for the enemy players.
 */
function rollForEnmies(numOfEnemies, val, msg, trueRoll) {
    if (!msg.member._roles.includes('727195200681934969')) {
        return error.error('You need to be hosting the game to run this command.', msg);
    } else if (isNaN(numOfEnemies)) {
        return error.error('Your first/second entries need to be a number. `!init-enemy <# of enemies> <optional: dice size>`.', msg);
    }

    let diceSize = val,
        rolls = [];
    if (!val) diceSize = 20;
    
    for (let i = 1; i < Number(numOfEnemies) + 1; i++) {
        let enemyObj = {};
        enemyObj.name = `Enemy #${i}`;
        enemyObj.roll = diceRoll.diceRoll(diceSize, msg);
        rolls.push(enemyObj);
    }

    if (trueRoll) return displaySortedRolls(sortArray(rolls), diceSize, msg);

    return rolls;
}

exports.rollForEnmies = rollForEnmies;
exports.rollForPlayers = rollForPlayers;
