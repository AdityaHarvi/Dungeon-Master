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
        if (err) return error.error('Something went wrong while updating the character information.', msg);

        if (callback) callback();
    });
}

exports.writeInfo = writeInfo;
