const ui = require("./UImethods"),
    db = require("../databaseHandler/dbHandler"),
    error = require("./error");

/**
 * Allows for the modification of the health/mana/strength stats of a player/bot.
 * @param {bool} incStat Whether to increase or decrease the value of a stat.
 * @param {array} rawInput The raw user input split into an arary.
 * @param {string} command The error message to send in the event of a failure.
 * @param {string} gameName The game name.
 * @param {int} playerChannel The player channel.
 * @param {object} msg The discord message object.
 */
function handleStats(incStat, rawInput, command, gameName, playerChannel, msg) {
    if (ui.dashAmount(rawInput) !== 3)
        return error.error("Missing the 3 required inputs.", command, msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].toLowerCase();

    if (parsedCommand[2] !== "health" && parsedCommand[2] !== "mana" && parsedCommand[2] !== "strength")
        return error.error("The second input needs to be `health`, `mana` or `strength`", command, msg);
    if (isNaN(parsedCommand[3]))
        return error.error("The third input needs to be a number.", command, msg);

    if (incStat) {
        db.healPlayer(parsedCommand[1], gameName, parsedCommand[2], Number(parsedCommand[3]), msg, (gainedAmount) => {
            msg.react("✅");
            msg.guild.channels.cache.get(playerChannel).send(`${parsedCommand[1]} has gained ${gainedAmount} ${parsedCommand[2]}`);
        });
    } else {
        db.damagePlayer(parsedCommand[1], gameName, parsedCommand[2], Number(parsedCommand[3]), msg, (lostAmount) => {
            msg.react("✅");
            msg.guild.channels.cache.get(playerChannel).send(`${parsedCommand[1]} has lost ${lostAmount} ${parsedCommand[2]}`);
        });
    }
}

/**
 * Modify the maximum value of health/mana of any player/bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {string} command The command to send in the case of an error.
 * @param {string} gameName The game name.
 * @param {int} playerChannel The player channel.
 * @param {object} msg The message object.
 */
function setMax(rawInput, command, gameName, playerChannel, msg) {
    if (ui.dashAmount(rawInput) !== 3)
        return error.error("Missing the 3 required inputs.", command, msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].toLowerCase();

    if (isNaN(parsedCommand[3]))
        return error.error("The third input needs to be a number.", command, msg);

    if (parsedCommand[2] === "health") {
        db.setMaxStat(parsedCommand[1], gameName, "maxHealth", parsedCommand[3], msg, () => {
            msg.react("✅");
            msg.guild.channels.cache.get(playerChannel).send(`${parsedCommand[1]}'s max ${parsedCommand[2]} has been changed. Do \`!info\` to take a look.`);
        });
    } else if (parsedCommand[2] === "mana") {
        db.setMaxStat(parsedCommand[1], gameName, "maxMana", parsedCommand[3], msg, () => {
            msg.react("✅");
            msg.guild.channels.cache.get(playerChannel).send(`${parsedCommand[1]}'s max ${parsedCommand[2]} has been changed. Do \`!info\` to take a look.`);
        });
    } else {
        return error.error("The second input needs to be `health` or `mana`", command, msg);
    }
}

exports.handleStats = handleStats;
exports.setMax = setMax;
