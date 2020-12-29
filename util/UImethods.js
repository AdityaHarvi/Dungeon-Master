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

/**
 * Determines if the user is the host of the game.
 * @param {string} gameHost The host of the game.
 * @param {string} inputUser The current user.
 */
function isHost(gameHost, inputUser) {
    return gameHost === inputUser;
}

/**
 * Concatinates the user input to create the Campaign Name.
 * @param {array} rawInput The raw user input.
 */
function getName(rawInput) {
    let name = "";
    for (let i = 1; i < rawInput.length; i++) {
        name += rawInput[i] + "_";
    }
    return name.slice(0, -1).toLowerCase();
}

/**
 * Concatinates a dashed command and splits it up appropriately.
 * @param {array} rawInput The raw user input.
 */
function parseDashedCommand(rawInput) {
    let ogString = "";
    rawInput.forEach(arg => {
        ogString += arg + " ";
    });

    return ogString.slice(0, -1).split(" -");
}

/**
 * Tests to see if the given string is a imgur URL ending with .png or .gif.
 * @param {string} imageURL The URL to test.
 */
function isImgurLink(imageURL) {
    let pattern = /^https:\/\/(i.)?imgur.com\/\w{7}.(png|gif)$/;
    return pattern.test(imageURL);
}

/**
 * Counts the number of dashes in the command.
 * @param {array} rawInput The raw user input.
 */
function dashAmount(rawInput) {
    let dashNumber = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            dashNumber++;
        }
    });
    return dashNumber
}

exports.removeReaction = removeReaction;
exports.isHost = isHost;
exports.getName = getName;
exports.parseDashedCommand = parseDashedCommand;
exports.isImgurLink = isImgurLink;
exports.dashAmount = dashAmount;
