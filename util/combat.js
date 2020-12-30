const error = require("../util/error"),
    display = require("../displayInfo/displayInfo"),
    db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
    dice = require("../util/dice");

/**
 * Performs an attack on the enemy. Auto rolls the dice.
 * @param {string} enemyName The enemy name.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function melee(enemyName, playerName, gameName, msg) {
    db.getBasicPlayerInfo(playerName, gameName, msg, playerInfo => {
        let roll = dice.roll();
        let attackRoll = roll + playerInfo.strength;

        db.getBasicPlayerInfo(enemyName, gameName, msg, enemyInfo => {
            if (attackRoll < enemyInfo.armor)
                return error.error(`Your attack-roll of \`${attackRoll}\` was not enough to overcome ${enemyName}'s armor-class of \`${enemyInfo.armor}\`.`, `D20 (${roll}) + ${playerInfo.strength}`, msg);

            db.getItemInfo(playerInfo.weapon, false, msg, itemInfo => {
                let damageRoll = dice.roll(itemInfo.damage_dice);
                db.damagePlayer(enemyName, gameName, "health", damageRoll, msg);
                display.attackInfo(playerInfo, enemyName, itemInfo, damageRoll, msg);
            });
        });
    });
}

/**
 * Increase the mana of the player at the cost of 2x their health.
 * @param {int} bleedAmount The amount of mana to gain.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name
 * @param {object} msg The discord message object.
 */
function bleed(bleedAmount, playerName, gameName, msg) {
    db.getBasicPlayerInfo(playerName, gameName, msg, playerInfo => {
        if (playerInfo.mana === playerInfo.maxMana) {
            return error.error("You're already at max mana.", undefined, msg);
        } else if ((playerInfo.mana + bleedAmount) > playerInfo.maxMana) {
            bleedAmount = playerInfo.maxMana - playerInfo.mana;
            msg.channel.send(`Bleed amount reduced to \`${bleedAmount}\`.`);
        }

        if ((bleedAmount * 2) >= playerInfo.health)
            return error.error("You do not have enough health to do this action.", "Bleeding takes up twice the amount of HP. So if you wanted to regen 2 MP, it needs 4 HP!", msg);

        db.bleedPlayer(bleedAmount * 2, bleedAmount, playerName, gameName, () => {
            msg.channel.send(`You've lost \`${bleedAmount * 2}\` HP and gained \`${bleedAmount}\` MP.`);
        });
    });
}

/**
 * Consumes an item from the players inventory and applies the appropriate boosts.
 * @param {array} rawInput The raw user input split into an array.
 * @param {string} playerName The player name.
 * @param {string} gameName The game name.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function use(rawInput, playerName, gameName, msg) {
    let itemName = ui.getName(rawInput);
    db.useItem(itemName, playerName, gameName, msg);
}

/**
 * Casts a spell on a target.
 * @param {array} rawInput The name of the spell being cast.
 * @param {string} playerName The name of the player.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function cast(rawInput, playerName, gameObject, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 1 || dashAmount > 2)
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the names. Player/Enemy names are only needed if casting an attack/healing spell.\n`!cast -<spell name> -<player/enemy name>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    db.getSpellInfo(parsedCommand[1], false, msg, spellInfo => {
        if (spellInfo.type !== "misc") {
            if (!parsedCommand[2]) {
                return error.error("Who are you casting this spell on?", undefined, msg);
            } else if (!gameObject.players.includes(parsedCommand[2])) {
                return error.error(`Could not find \`${parsedCommand[2]}\` in the member list.`, "Player/Enemy names are case sensitive. Try checking your spelling.", msg);
            }
        }

        db.castSpell(parsedCommand[2], playerName, gameObject.game_title, parsedCommand[1], msg);
    });
}

/**
 * Allows the host to control a player and attack for them. Useful for when controlling a bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {array} playerList The list of players.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function adminMelee(rawInput, playerList, gameName, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("This command takes exactly 2 inputs.", "`!a-attack -<player name to control> -<player name to attack>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    if (!playerList.includes(parsedCommand[1]))
        return error.error(`Was not able to find ${parsedCommand[1]} in player list.`, undefined, msg);
    if (!playerList.includes(parsedCommand[2]))
        return error.error(`Was not able to find ${parsedCommand[2]} in player list.`, undefined, msg);

    melee(parsedCommand[2], parsedCommand[1], gameName, msg);
}

/**
 * Allows the host to control a player and cast a spell for them. Useful for when controlling a bot.
 * @param {array} rawInput The raw user input split into an array.
 * @param {array} playerList The list of players.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function adminCast(rawInput, playerList, gameObject, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 2 || dashAmount > 3)
        return error.error("This command takes up to 3 inputs.", "`!a-cast -<player name to control> -<spell name> -<target name: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[2] = parsedCommand[2].replace(/ /g, "_").toLowerCase();

    if (!playerList.includes(parsedCommand[1]))
        return error.error(`Was not able to find ${parsedCommand[1]}`, undefined, msg);
    if (parsedCommand[3] && !playerList.includes(parsedCommand[3]))
        return error.error(`Was not able to find ${parsedCommand[3]}`, undefined, msg);

    // Modify the input so that it can be intrepreted by the 'cast' function.
    rawInput.splice(1,1);
    cast(rawInput, parsedCommand[1], gameObject, msg);
}

exports.melee = melee;
exports.bleed = bleed;
exports.use = use;
exports.cast = cast;
exports.adminMelee = adminMelee;
exports.adminCast = adminCast;
