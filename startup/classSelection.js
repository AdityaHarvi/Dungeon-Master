const error = require('../util/error'),
    Discord = require("discord.js"),
    ui = require("../util/UImethods"),
    displayInfo = require('../gameInfo/displayInfo');

/**
 * Assigns the proper health/mana/strength point depending on the class selected.
 * @param {string} playerClass The selected class of the player.
 * @param {object} playerObject Player information object.
 */
function _classSelection(playerClass, playerObject) {
    switch (playerClass) {
        case 'juggernaut':
            playerObject.class = 'Juggernaut';
            playerObject.health = 40;
            playerObject.strength = 0;
            playerObject.mana = 0;
            break;
        case 'assassin':
            playerObject.class = 'Assassin';
            playerObject.health = 18;
            playerObject.strength = 6;
            playerObject.mana = 0;
            break;
        case 'wizard':
            playerObject.class = 'Wizard';
            playerObject.health = 15;
            playerObject.strength = 0;
            playerObject.mana = 14;
            break;
        case 'paladin':
            playerObject.class = 'Paladin';
            playerObject.health = 30;
            playerObject.strength = 4;
            playerObject.mana = 2;
            break;
        case 'cleric':
            playerObject.class = 'Cleric';
            playerObject.health = 28;
            playerObject.strength = 1;
            playerObject.mana = 6;
            break;
        case 'archmage':
            playerObject.class = 'Archmage';
            playerObject.health = 20;
            playerObject.strength = 3;
            playerObject.mana = 8;
            break;
        case 'bard':
            playerObject.class = 'Bard';
            playerObject.health = 25;
            playerObject.strength = 2;
            playerObject.mana = 4;
            break;
    }

    playerObject.maxHealth = playerObject.health;
    playerObject.maxMana = playerObject.mana;

    return playerObject;
}

function _getMoreInfoClassSelectionEmbed(playerName) {
    return new Discord.MessageEmbed()
        .setColor("0xcef542")
        .setTitle(`${playerName}'s Class Selection:`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Click ℹ️ to toggle for more info.")
        .addFields(
            {name: "🛡️ Juggernaut", value: "❤️40 | 💪0 | 🧪0", inline: true},
            {name: "⚔️ Assassin", value: "❤️18 | 💪6 | 🧪0", inline: true},
            {name: "🪄 Wizard", value: "❤️15 | 💪0 | 🧪14", inline: true},
            {name: "☀️ Paladin", value: "❤️30 | 💪4 | 🧪2", inline: true},
            {name: "⚕️ Cleric", value: "❤️28 | 💪1 | 🧪6", inline: true},
            {name: "🧙 Archmage", value: "❤️20 | 💪3 | 🧪8", inline: true},
            {name: "🎸 Bard", value: "❤️25 | 💪2 | 🧪4", inline: true}
        )
        .setFooter("!help class if you want to read more!")
}

function _getClassSelectionEmbed(playerName) {
    return new Discord.MessageEmbed()
        .setColor("0xcef542")
        .setTitle(`${playerName}'s Class Selection:`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Click ℹ️ to toggle for more info.")
        .addFields(
            {name: "🛡️ Juggernaut", value: "\u200b", inline: true},
            {name: "⚔️ Assassin", value: "\u200b", inline: true},
            {name: "🪄 Wizard", value: "\u200b", inline: true},
            {name: "☀️ Paladin", value: "\u200b", inline: true},
            {name: "⚕️ Cleric", value: "\u200b", inline: true},
            {name: "🧙 Archmage", value: "\u200b", inline: true},
            {name: "🎸 Bard", value: "\u200b", inline: true}
        )
        .setFooter("!help class if you want to read more!")
}

function _isPlayer(playerName, user) {
    return playerName === user;
}

/**
 * Creates the base character stats.
 * @param {stirng} playerClass The class that the player has chosen.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function generateClassSelectionUI(gameObject, playerName, msg) {
    const selectionEmbed = _getClassSelectionEmbed(playerName);
    const tempUserInfo = {};
    let infoFlag = false;

    let playerObject = {};
    // playerObject = _classSelection(playerClass, playerObject);
    playerObject.game = gameObject.title;
    playerObject.name = playerName;
    playerObject.spells = [];
    playerObject.abilities = [];
    playerObject.items = ["bare_fist"];
    playerObject.currentlyEquiped = "bare_fist";
    playerObject.diceSize = 10;
    playerObject.journal = [];
    playerObject.maxInventory = 15;

    // writeInfo.writeInfo(playerObject, msg, () => {
    //     displayInfo.displayplayerObject(playerObject.name, msg);
    //     msg.channel.send(`Your ${playerObject.class} character has been created. Do \`!info\` to view your stats.`);
    // });
    // Set the message and setup emotes.
    msg.channel.send(selectionEmbed).then(async classEmbed => {
        await classEmbed.react("🛡️");
        await classEmbed.react("⚔️");
        await classEmbed.react("🪄");
        await classEmbed.react("☀️");
        await classEmbed.react("⚕️");
        await classEmbed.react("🧙");
        await classEmbed.react("🎸");
        await classEmbed.react("ℹ️");

        const filter = (reaction, user) => {
            tempUserInfo.name = user.username;
            return ["🛡️","⚔️","🪄","☀️","⚕️","🧙","🎸","ℹ️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = classEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "ℹ️":
                    if (_isPlayer(playerName, tempUserInfo.name)) {
                        if (infoFlag) {
                            infoFlag = false;
                            const updatedEmbed = _getClassSelectionEmbed(playerName);
                            classEmbed.edit(updatedEmbed);
                        } else {
                            infoFlag = true;
                            const updatedEmbed = _getMoreInfoClassSelectionEmbed(playerName);
                            classEmbed.edit(updatedEmbed);
                        }
                    }
                    break;
            }
            ui.removeReaction(reaction);
        });
    });
}

exports.generateClassSelectionUI = generateClassSelectionUI;
