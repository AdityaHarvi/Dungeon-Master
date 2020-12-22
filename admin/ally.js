const fs = require('fs'),
    error = require('../util/error'),
    displayInfo = require('../displayInfo/displayInfo');

/**
 * Creates a allied character. The host must control their actions.
 * @param {string} name The name of the character.
 * @param {number} hp The value of their health.
 * @param {number} str The value of their strength.
 * @param {number} mp The value of their mana.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function allyCreation(name, hp, str, mp, msg) {
    if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    // Throws an error if a player tries to re-create their character.
    if (fs.existsSync(`playerInfo/${name.toLowerCase()}.json`)) {
        return error.error('Character already exists.', msg)
    } else if (isNaN(hp) || isNaN(str) || isNaN(mp)) {
        return error.error('`hp`, `str`, and `mp` must be numbers.', msg);
    }

    let playerInfo = {};
    playerInfo.name = name;
    playerInfo.maxHealth = hp;
    playerInfo.maxMana = mp;
    playerInfo.health = hp;
    playerInfo.strength = str;
    playerInfo.mana = mp;
    playerInfo.diceSize = 10;
    playerInfo.spells = [];
    playerInfo.abilities = [];
    playerInfo.items = ["bare_fist"];
    playerInfo.currentlyEquiped = 'bare_fist';
    playerInfo.isBot = true;

    // Creates a new character profile.
    writeInfo.writeInfo(playerInfo, msg, () => {
        displayInfo.displayPlayerInfo(playerInfo.name, msg);
        msg.channel.send('The ally was created.');
    });
}

/**
 * Kills off an allied player.
 * @param {string} name The name of the allied character.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function killAlly(name, msg) {
    if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    // Read player information.
    getInfo.getPlayerInfo(name, msg, (playerInfo) => {
        if (!playerInfo.isBot) return error.error('You cannot kill an actual player.', msg);

        // Deletes player file.
        fs.unlinkSync(`playerInfo/${name}.json`);
        msg.channel.send(`${name} has been killed off!`);
    });
}

exports.killAlly = killAlly;
exports.allyCreation = allyCreation;
