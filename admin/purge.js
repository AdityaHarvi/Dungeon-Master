const error = require('../util/error');

/**
 * Deletes a certain number of messages. Useful for cleaning up the chat.
 * @param {number} size The # of messages to be deleted.
 * @param {object} msg The object containing information about the message sent through discord.
 */
async function purge(size, msg) {
    if (isNaN(size)) return error.error('Your input needs to be a number. `!purge <#>`', msg);
    if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    msg.delete();

    const fetched = await msg.channel.messages.fetch({limit: size});

    msg.channel.bulkDelete(fetched).catch(error => msg.channel.send('Something went wrong while trying to delete a message.'));
}

exports.purge = purge;
