const Discord = require("discord.js");

/**
 * Creates an error message with custom fields.
 * @param {string} message The custom error message to be dispalyed.
 * @param {string} subMessage If the message contains further information, it will be displayed here.
 * @param {object} msg Contains information about the message sent to discord.
 */
function error(message, subMessage = " ", msg) {
    const errorEmbed = new Discord.MessageEmbed()
        .setColor("0xF11818")
        .setTitle(message)
        .setDescription(subMessage)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")

        msg.channel.send(errorEmbed);
}

exports.error = error;
