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
        if (err) return error.error("Has the player joined the party? I do not see them in my list.", null, msg);

        let playerInfo = JSON.parse(jsonString);

        return (callback) ? callback(playerInfo) : playerInfo;
    });
}

/**
 * Get the game info contained within the JSON file. This file is generated upon game creation.
 * @param {object} gameName The name of the campaign.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {function} callback Callback function.
 */
function getGameInfo(gameName, msg, callback) {
    fs.readFile(`gameData/${gameName}/${gameName}.json`, (err, jsonString) => {
        if (err) return error.error("I ran into an issue, I can't seem to find the game file.", null, msg);

        let gameInfo = JSON.parse(jsonString);

        return (callback) ? callback(gameInfo) : gameInfo;
    });
}

exports.getPlayerInfo = getPlayerInfo;
exports.getGameInfo = getGameInfo;
