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
 * Heals the target player with the amount specified on the spell.
 * @param {object} targetInfo The target information.
 * @param {object} playerInfo The player casting the spell's information.
 * @param {object} spellInfo The spell information.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function heal(targetInfo, playerInfo, spellInfo, msg, client, activateAbility) {
    if (Number(targetInfo.health) === 0) {
        return error.error(`${targetInfo.name} is dead. You need to revive them!`, msg);
    } else if (Number(spellInfo.mana) > Number(playerInfo.mana)) {
        return error.error('You do not have enough mana.', msg);
    }

    let originalSpell = spellInfo;

    if (playerInfo.abilities.includes('mana_recycling')) {
        spellInfo.mana = Math.round(Number(spellInfo.mana) / 2);
    }

    let extraInfo = {};
    playerInfo.mana = Number(playerInfo.mana) - Number(spellInfo.mana);

    if (activateAbility && activateAbility === 'prayer') {
        extraInfo.extraRoll = Number(diceRoll.diceRoll(10, msg));
        spellInfo.heal = Number(spellInfo.heal) + extraInfo.extraRoll;
        extraInfo.specialAbility2 = 'Prayer';
    }

    if (targetInfo.name !== playerInfo.name) { // If the player is targetting a different player.
        targetInfo.health = Number(targetInfo.health) + Number(spellInfo.heal);

        if (spellInfo.name === 'Overheal') {
            client.channels.cache.get('728412435131924482').send(`${targetInfo.name}'s old max HP was \`${targetInfo.maxHealth}\`, remember to reduce this by ${spellInfo.heal} after the battle.`);
            targetInfo.maxHealth = Number(targetInfo.maxHealth) + Number(spellInfo.heal);
        } else if (Number(targetInfo.health) > Number(targetInfo.maxHealth)) {
            targetInfo.health = Number(targetInfo.maxHealth);
        }

        extraInfo.target = targetInfo;
        writeInfo.writeInfo(playerInfo, msg, () => {
            writeInfo.writeInfo(targetInfo, msg, () => {
                spellInfo = originalSpell;
            });
        });
    } else { // If the player is targetting themself for the healing spell.
        playerInfo.health = Number(playerInfo.health) + Number(spellInfo.heal);

        if (spellInfo.name === 'Overheal') {
            client.channels.cache.get('728412435131924482').send(`${playerInfo.name}'s old max HP was \`${targetInfo.maxHealth}\``);
            playerInfo.maxHealth = Number(playerInfo.maxHealth) + Number(spellInfo.heal);
        } else if (Number(playerInfo.health) > Number(playerInfo.maxHealth)) {
            playerInfo.health = Number(playerInfo.maxHealth);
        }

        extraInfo.target = playerInfo;
        writeInfo.writeInfo(playerInfo, msg, () => {
            spellInfo = originalSpell;
        });
    }

    displayInfo.displaySpellCast(playerInfo, spellInfo, extraInfo, msg);
}

/**
 * Reads spell information.
 * @param {string} spellName The name of the spell being cast.
 * @param {object} msg The object containing information about the message sent through discord.
 * @param {string} target The target for who to cast a spell on.
 * @param {stirng} playerName The name of the player, this is only used if you are force-casting for a player.
 */
function cast(rawInput, playerName, targetName, gameObject, msg) {
    let testForDash = 0;
    rawInput.forEach(arg => {
        if (arg.charAt(0) === "-") {
            testForDash++;
        }
    });
    if (testForDash < 2) {
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the names.\n`!cast -<spell name> -<player/enemy name>`", msg);
    }

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(" ", "_").toLowerCase();

    if (!gameObject.players.includes(plarsedCommand[2])) {
        return error.error(`Could not find \`${parsedCommand[2]}\` in the player list.`, "Player/Enemy names are case sensitive. Try checking your spelling.", msg);
    }

    console.log(parsedCommand);

    // if (playerName && host) {
    //     name = playerName
    // } else if (playerName) {
    //     return error.error('You need to be hosting the game to run this command.', msg);
    // } else if (!spellInfo) {
    //     return error.error('Cannot find the spell you are looking for.', msg);
    // } else if (isNaN(spellInfo.mana)) {
    //     return msg.channel.send('Since this does not have a set mana cost, just verbally tell what you want and the DM will deduct mana accordingly.');
    // }

    // // Read player information.
    // getInfo.getPlayerInfo(name, msg, (playerInfo) => {
    //     if (playerInfo.abilities.includes('mana_recycling')) {
    //         spellInfo.mana = Math.floor(Number(spellInfo.mana) / 2);
    //     }

    //     // Error handling.
    //     if (!playerInfo.spells.includes(spellName)) { // Check if the player has learnt the spell.
    //         return error.error('You have not learnt this spell', msg);
    //     } else if (activateAbility && !playerInfo.abilities.includes(activateAbility + ' (A)')) {
    //         return error.error('You do not have that ability', msg);
    //     } else if (spellInfo.heal) { // Healing spells need to perform different actions from damage spells.
    //         return getTargetInformation(playerInfo, spellInfo, target, msg, client, activateAbility);
    //     }

    //     if (spellName === 'creation') {
    //         return msg.channel.send(`${playerInfo.name} has cast creation! Your mana will be deducted accordingly.`);
    //     }

    //     if (Number(playerInfo.mana) < Number(spellInfo.mana)) { // Check if the player has enough mana.
    //         return error.error('You do not have enough mana to cast this spell.', msg);
    //     }

    //     // Modifies player mana and updates the player information.
    //     playerInfo.mana = Number(playerInfo.mana) - Number(spellInfo.mana);
    //     writeInfo.writeInfo(playerInfo, msg, () => {
    //         let extraInfo = {};

    //         if (spellInfo.damage) {
    //             extraInfo.damage = Number(spellInfo.damage);

    //             if (activateAbility && activateAbility === 'meditate') {
    //                 extraInfo.extraRoll = Number(diceRoll.diceRoll(10, msg));
    //                 extraInfo.damage += extraInfo.extraRoll;
    //                 extraInfo.specialAbility2 = 'Meditate';
    //             }

    //             if (spellInfo.diceSize) { // Special modifier for spells.
    //                 extraInfo.roll = Number(diceRoll.diceRoll(spellInfo.diceSize, msg));

    //                 if (playerInfo.abilities.includes('i_am_my_own_plus_1')) {
    //                     extraInfo.specialAbility = 'i_am_my_own_plus_1';
    //                     extraInfo.damage += 1;
    //                 }
                    
    //                 extraInfo.damage += extraInfo.roll;
    //             }
    //         }

    //         displayInfo.displaySpellCast(playerInfo, spellInfo, extraInfo, msg);
    //         spellInfo = spells.spells[spellName];
    //     });
    // });
}

exports.melee = melee;
exports.bleed = bleed;
exports.use = use;
exports.cast = cast;
