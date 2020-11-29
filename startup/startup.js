const fs = require('fs'),
    error = require('../util/error'),
    displayInfo = require('../gameInfo/displayInfo'),
    writeInfo = require('../gameInfo/writeInfo');

/**
 * Assigns the proper health/mana/strength point depending on the class selected.
 * @param {string} playerClass The selected class of the player.
 * @param {object} playerInfo Player information object.
 */
function classSelection(playerClass, playerInfo) {
    switch (playerClass) {
        case 'juggernaut':
            playerInfo.class = 'Juggernaut';
            playerInfo.health = 40;
            playerInfo.strength = 0;
            playerInfo.mana = 0;
            break;
        case 'assassin':
            playerInfo.class = 'Assassin';
            playerInfo.health = 18;
            playerInfo.strength = 6;
            playerInfo.mana = 0;
            break;
        case 'wizard':
            playerInfo.class = 'Wizard';
            playerInfo.health = 15;
            playerInfo.strength = 0;
            playerInfo.mana = 14;
            break;
        case 'paladin':
            playerInfo.class = 'Paladin';
            playerInfo.health = 30;
            playerInfo.strength = 4;
            playerInfo.mana = 2;
            break;
        case 'cleric':
            playerInfo.class = 'Cleric';
            playerInfo.health = 28;
            playerInfo.strength = 1;
            playerInfo.mana = 6;
            break;
        case 'archmage':
            playerInfo.class = 'Archmage';
            playerInfo.health = 20;
            playerInfo.strength = 3;
            playerInfo.mana = 8;
            break;
        case 'bard':
            playerInfo.class = 'Bard';
            playerInfo.health = 25;
            playerInfo.strength = 2;
            playerInfo.mana = 4;
            break;
    }

    playerInfo.maxHealth = playerInfo.health;
    playerInfo.maxMana = playerInfo.mana;

    return playerInfo;
}

/**
 * Creates the base character stats.
 * @param {stirng} playerClass The class that the player has chosen.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function generateDefaultCharacter(playerClass, msg) {   
    // Throws an error if a player tries to re-create their character.
    if (fs.existsSync(`playerInfo/${msg.member.nickname}.json`)) return error.error('You have already created a character.', msg);

    let playerInfo = {};
    playerInfo = classSelection(playerClass, playerInfo);
    playerInfo.name = msg.member.nickname;
    playerInfo.spells = [];
    playerInfo.abilities = [];
    playerInfo.items = ["bare_fist"];
    playerInfo.currentlyEquiped = 'bare_fist';
    playerInfo.diceSize = 10;
    playerInfo.journal = [];
    playerInfo.maxInventory = 15;

    writeInfo.writeInfo(playerInfo, msg, () => {
        displayInfo.displayPlayerInfo(playerInfo.name, msg);
        msg.channel.send(`Your ${playerInfo.class} character has been created. Do \`!info\` to view your stats.`);
    });
}

exports.generateDefaultCharacter = generateDefaultCharacter;
