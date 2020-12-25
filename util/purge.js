const error = require("./error"),
    ui = require("./UImethods");

/**
 * Deletes a certain number of messages. Useful for cleaning up the chat.
 * @param {number} size The # of messages to be deleted.
 * @param {object} msg The object containing information about the message sent through discord.
 */
async function purge(size, playerName, gameHost, msg) {
    if (!gameHost || !ui.isHost(gameHost, playerName)) {
        return error.error("You need to be hosting a game to be able to run this command.", "Create a game with `!create <campaign name>` to start one.", msg);
    }

    msg.delete();

    const fetched = await msg.channel.messages.fetch({limit: size});

    msg.channel.bulkDelete(fetched).catch(error => msg.channel.send('Something went wrong while trying to delete a message.'));
}

exports.purge = purge;
