const Discord = require("discord.js");

/**
 * Randomly generates a number between 1 and a given size (default 20).
 * @param {integer} diceSize The maximum size of the dice. This is an optional field.
 */
function roll(diceSize=20) {
    return 1 + Math.floor(Math.random() * diceSize);
}

/**
 * Sorts a given array in decending order.
 * @param {array} arr The given array.
 */
function _sortArray(arr) {
    return arr.sort((a, b) => parseFloat(b.roll) - parseFloat(a.roll));
}

/**
 * Populates the fields for the embed.
 * @param {array} sortedArray The given array.
 */
function _getFields(sortedArray) {
    let fields = [];

    for (let i = 0; i < sortedArray.length; i++) {
        fields[i] = {name: `${sortedArray[i].name}: \`${sortedArray[i].roll}\``, 
                    value: `${(i + 1 < sortedArray.length) ? `**${sortedArray[i + 1].name}: \`${sortedArray[i + 1].roll}\`**` : '\u200b'}`};
        i++;
    }

    return fields;
}

function init(players, playerChannel, msg) {
    let initObj = {};
    let initRolls = [];
    players.forEach(player => {
        initObj.roll = roll();
        initObj.name = player;
        initRolls.push(initObj);
    });

    let initEmbed = new Discord.MessageEmbed()
        .setColor("0x03fca5")
        .setTitle("Rolling with D20")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://i.imgur.com/fEVNr1J.png")
        .addFields(_getFields(_sortArray(initRolls)))
        .setFooter("Rolls are ordered from highest to least.\nThis message has been pinned so it can be accessed quickly while in battle.")

    msg.client.channels.cache.get(playerChannel).send(initEmbed).then(message => message.pin());
}

exports.init = init;
exports.roll = roll;
