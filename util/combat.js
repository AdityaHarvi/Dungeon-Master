const error = require("../util/error"),
    display = require("../displayInfo/displayInfo"),
    db = require("../databaseHandler/dbHandler"),
    ui = require("./UImethods"),
    dice = require("../util/dice");

/**
 * Rolls the dice and adds it to the strength of the player.
 * @param {string} risk If the player has a special ability, they can use it here.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function melee(enemyName, playerName, gameName, msg) {
    db.getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        let roll = dice.roll();
        let attackRoll = roll + playerInfo.strength;

        db.getBaiscPlayerInfo(enemyName, gameName, msg, enemyInfo => {
            if (attackRoll < enemyInfo.armor) {
                return error.error(`Your attack-roll of \`${attackRoll}\` was not enough to overcome ${enemyName}'s armor-class of \`${enemyInfo.armor}\`.`, `D20 (${roll}) + ${playerInfo.strength}`, msg);
            }

            db.getItemInfo(playerInfo.weapon, false, msg, itemInfo => {
                let damageRoll = dice.roll(itemInfo.damage_dice);
                db.damagePlayer(playerName, gameName, damageRoll, msg);
                display.attackInfo(playerInfo, itemInfo, damageRoll, msg);
            });
        });
    });
}

function bleed(bleedAmount, playerName, gameName, msg) {
    db.getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        if (playerInfo.mana === playerInfo.maxMana) {
            return error.error("You're already at max mana.", null, msg);
        } else if ((playerInfo.mana + bleedAmount) > playerInfo.maxMana) {
            bleedAmount = playerInfo.maxMana - playerInfo.mana;
            msg.channel.send(`Bleed amount reduced to \`${bleedAmount}\`.`);
        }

        if ((bleedAmount * 2) >= playerInfo.health) {
            return error.error("You do not have enough health to do this action.", "Bleeding takes up twice the amount of HP. So if you wanted to regen 2 MP, it needs 4 HP!", msg);
        }

        db.bleedPlayer(bleedAmount * 2, bleedAmount, playerName, gameName, () => {
            msg.channel.send(`You've lost \`${bleedAmount * 2}\` HP and gained \`${bleedAmount}\` MP.`);
        });
    });
}

/**
 * Consumes an item from the players inventory.
 * @param {string} itemName The item to be consumed.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function use(rawInput, playerName, gameName, msg) {
    let itemName = ui.getName(rawInput);
    db.useItem(itemName, playerName, gameName, msg);
}

/**
 * Reads spell information.
 * @param {string} spellName The name of the spell being cast.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {string} target The target for who to cast a spell on.
 * @param {stirng} playerName The name of the player, this is only used if you are force-casting for a player.
 */
function cast(rawInput, playerName, gameObject, msg) {
    let testForDash = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            testForDash++;
        }
    });

    if (testForDash < 1 || testForDash > 2) {
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the names. Player/Enemy names are only needed if casting an attack/healing spell.\n`!cast -<spell name> -<player/enemy name>`", msg);
    }

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    db.getSpellInfo(parsedCommand[1], false, msg, spellInfo => {
        if (spellInfo.type !== "misc") {
            if (!parsedCommand[2]) {
                return error.error("Who are you casting this spell on?", null, msg);
            } else if (!gameObject.players.includes(parsedCommand[2])) {
                return error.error(`Could not find \`${parsedCommand[2]}\` in the member list.`, "Player/Enemy names are case sensitive. Try checking your spelling.", msg);
            }
        }

        db.castSpell(parsedCommand[2], playerName, gameObject.game_title, parsedCommand[1], msg);
    });
}

exports.melee = melee;
exports.bleed = bleed;
exports.use = use;
exports.cast = cast;
