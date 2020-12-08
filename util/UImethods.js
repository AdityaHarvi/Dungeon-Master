/**
 * Removes all newly added reactions so that only 1 reaction is present at any time.
 * @param {reaction} reaction Reaction object.
 */
function removeReaction(reaction) {
    reaction.users.cache.forEach(user => {
        if (!user.bot) {
            reaction.users.remove(user.id);
        }
    });
}

exports.removeReaction = removeReaction;
