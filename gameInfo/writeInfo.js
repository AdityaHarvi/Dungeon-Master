const fs = require('fs'),
    error = require('../util/error');

/**
 * Updates the player profile.
 * @param {string} playerInfo Object containing the player information.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {callback} callback Callback function.
 */
function writeInfo(playerInfo, msg, callback) {
    fs.writeFile(`playerInfo/${playerInfo.name}.json`, JSON.stringify(playerInfo), (err) => {
        if (err) return error.error("Something went wrong while updating the character information.", null, msg);

        if (callback) callback();
    });
}

/**
 * Creates the game folder, game JSON file, and player folder for the game.
 * @param {object} gameObject The game object.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {callback} callback Callback function.
 */
function createGame(gameObject, msg, callback) {
    fs.mkdirSync(`gameData/${gameObject.title}`, (err) => {
        if (err) return error.error("Error creating the game folder.", null, msg);
    })
    fs.writeFile(`gameData/${gameObject.title}/${gameObject.title}.json`, JSON.stringify(gameObject), (err) => {
        if (err) return error.error("Something went wrong while creating the game.", null, msg);
    });
    fs.mkdirSync(`gameData/${gameObject.title}/playerInfo`, (err) => {
        if (err) return error.error("Error creating the player folder.", null, msg);
    })
    if (callback) callback();
}

exports.writeInfo = writeInfo;
exports.createGame = createGame;
