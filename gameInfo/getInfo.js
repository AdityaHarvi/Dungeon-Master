const fs = require('fs'),
    error = require('../util/error');

/**
 * Gets the player information by reading the file.
 * @param {string} playerName The name of the player.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {function} callback Callback function.
 */
function getPlayerInfo(playerName, msg, callback) {
    fs.readFile(`playerInfo/${playerName}.json`, 'utf8', (err, jsonString) => {
        if (err) return error.error('Has the player joined the party? I do not see them in my list.', msg);

        let playerInfo = JSON.parse(jsonString);

        return (callback) ? callback(playerInfo) : playerInfo;
    });
}

exports.getPlayerInfo = getPlayerInfo;
