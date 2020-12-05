/**
 * Creates an error message with custom fields.
 * @param {string} message The custom error message to be dispalyed.
 * @param {string} subMessage If the message contains further information, it will be displayed here.
 * @param {object} msg Contains information about the message sent to discord.
 */
function error(message, subMessage = " ", msg) {
    const errorMsg = {
        color: 0xF11818,
        title: message,
        description: subMessage,
        author: {
            name: 'Dungeon Master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        }
    };
    msg.channel.send({embed: errorMsg});
}

exports.error = error;
