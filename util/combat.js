const error = require("../util/error"),
    display = require("../displayInfo/displayInfo"),
    db = require("../databaseHandler/dbHandler"),
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

            db.getItemInfo(playerInfo.weapon, msg, itemInfo => {
                let damageRoll = dice.roll(itemInfo.damage_dice);
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

        db.bleedPlayer(bleedAmount * 2, bleedAmount, playerName, gameName, msg, () => {
            msg.channel.send(`You've lost \`${bleedAmount * 2}\` HP and gained \`${bleedAmount}\` MP.`);
        });
    });
}

exports.melee = melee;
exports.bleed = bleed;
