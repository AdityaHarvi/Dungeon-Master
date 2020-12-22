const items = require('../inventories/items'),
    spells = require('../inventories/spells'),
    Discord = require("discord.js"),
    ui = require("../util/UImethods"),
    db = require("../databaseHandler/dbHandler"),
    error = require('../util/error');

/**
 * This function replaces an empty array with keyword "None" to correct the empty-discord-embed issue. 
 * @param {array} objectToCheck The array to check if it is empty.
 */
function checkIfExists(objectToCheck) {
    return (objectToCheck.length === 0) ? "None" : objectToCheck;
}

/**
 * Populates the fields for the jounal embed.
 * @param {object} playerInfo The player object.
 */
function getJournalFields(playerInfo) {
    let fields = [];

    // Base message that the player will see if they don't have any notes.
    if (playerInfo.journal.length === 0) {
        return fields[0] = {name: 'The pages got wet from the shipwreck and you can\'t make out any of the notes. At least future additions will be easier to read.', value: 'Do `!add-note <note title> <message>` to start writing in your journal!'};
    }

    for (var i = 0; i < playerInfo.journal.length; i++) {
        fields[i] = {name: playerInfo.journal[i].name, value: playerInfo.journal[i].message};
    }

    return fields;
}

/**
 * Displays the journal as a private message to the player.
 * @param {string} playerName Name of the player.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displayNote(playerName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        const journalEntryEmbed = {
            color: 0x32a8a4,
            title: `${playerInfo.name}'s Journal (${playerInfo.journal.length}/25)`,
            thumbnail: {
                url: 'https://i.imgur.com/XYraIdT.png'
            },
            fields: getJournalFields(playerInfo)
        };

        return msg.author.send({embed: journalEntryEmbed});
    });
}

function getSpellCastFields(playerInfo, spellInfo, extraInfo) {
    let fields = [];

    fields[0] = {name: `Remaining Mana: ${playerInfo.mana}`, value: `Spell Cost: ${spellInfo.mana}`};

    if (spellInfo.damage && spellInfo.diceSize) {
        fields[1] = {name: `Total Damage Dealt: \`${extraInfo.damage}\``, value: `${(extraInfo.extraRoll) ? `D10 (${extraInfo.extraRoll}) + ` : ''}D${spellInfo.diceSize} (${extraInfo.roll}) + ${spellInfo.damage} ${(extraInfo.specialAbility) ? '+ 1' : '' }`, inline: true};
    } else if (spellInfo.damage) {
        fields[1] = {name: `Total Damage Dealt: \`${spellInfo.damage}\``, value: `${(extraInfo.extraRoll) ? `D10 (${extraInfo.extraRoll}) + ` : '\u200b'}`};
    } else if (spellInfo.heal) {
        fields[1] = {name: `${playerInfo.name} healed ${extraInfo.target.name} for \`${spellInfo.heal}\` HP`, value: `${(extraInfo.extraRoll) ? `D10 Roll: ${extraInfo.extraRoll}` : '\u200b'}`, inline:true};
    }

    if (extraInfo.extraRoll) {
        fields[2] = {name: '\u200b', value: `Ability Activated: \`${extraInfo.specialAbility2}\``, inline: true};
    }

    return fields;
}

function displaySpellCast(playerInfo, spellInfo, extraInfo, msg) {
    const spellCastEmbed = {
        color: 0xfc03b1,
        title: `${playerInfo.name} cast's ${spellInfo.name}`,
        thumbnail: {
            url: spellInfo.image
        },
        fields: getSpellCastFields(playerInfo, spellInfo, extraInfo)
    };

    if (extraInfo.specialAbility) {
        spellCastEmbed.footer = { text: `Passive ability "${extraInfo.specialAbility}" has been activated.` }
    }

    return msg.channel.send({embed: spellCastEmbed});
}

function getAttackFields(playerInfo, extraInfo) {
    let fields = [];

    fields[0] = {name: `Total Damage Dealt: \`${extraInfo.damage}\``, value: `${(playerInfo.firstRoll) ? `D${playerInfo.diceSize} (${playerInfo.firstRoll}) + ` : ''}D${playerInfo.diceSize} (${extraInfo.roll}) + ${playerInfo.strength} ${(extraInfo.specialAbility) ? '+ 1 ' : '' }`, inline: true};
    if (playerInfo.specialAbility2) {
        fields[1] = {name: `\u200b`, value: `Ability Activated: \`${playerInfo.specialAbility2}\``, inline: true};
    }

    return fields;
}

function displayAttactInfo(playerInfo, itemInfo, extraInfo, msg) {
    const attackEmbed = {
        color: 0x995e06,
        title: `${playerInfo.name} attacks with ${itemInfo.name}`,
        thumbnail: {
            url: itemInfo.image
        },
        fields: getAttackFields(playerInfo, extraInfo)
    };

    if (extraInfo.specialAbility) {
        attackEmbed.footer = { text: `Passive ability "${extraInfo.specialAbility}" has been activated.` };
    }

    return msg.channel.send({embed: attackEmbed});
}

function getDiceRoll(diceSize, msg) {

    getInfo.getPlayerInfo(msg.member.nickname, msg, (playerInfo) => {
        let extraInfo = {};
        extraInfo.diceSize = (args[1]) ? args[1] : 20;
        extraInfo.roll = Number(diceRoll.diceRoll(extraInfo.diceSize, msg));
        extraInfo.finalRoll = extraInfo.roll;
        extraInfo.specialAbility = false;

        if (playerInfo.abilities.includes('i_am_my_own_plus_1')) {
            extraInfo.specialAbility = 'i_am_my_own_plus_1';
            extraInfo.finalRoll += 1;
        }

        displayInfo.displayDiceRoll(playerInfo.name, extraInfo.finalRoll, extraInfo.roll, extraInfo.diceSize, extraInfo.specialAbility, msg);
    });
}

function displayDiceRoll(playerName, finalRoll, rollVal, diceSize, specialAbility, msg) {
    const diceRollEmbed = {
        color: 0xa8a632,
        title: `${playerName} rolls a \`${finalRoll}\``,
        thumbnail: {
            url: 'https://i.imgur.com/4EAe8y6.png'
        },
        fields: {name: `\u200b`, value: `D${diceSize} (${rollVal}) ${(specialAbility) ? ' + 1' : ''}`, inline: true}
    };

    if (specialAbility) {
        diceRollEmbed.footer = { text: `Passive ability "${specialAbility}" has been activated.` };
    }

    return msg.channel.send({embed: diceRollEmbed});
}


function _getPlayerInfoEmbed(playerInfo, itemInfo) {
    let bonusArmor = "\u200b";
    let bonusStrength = "\u200b";
    let bonusMana = "\u200b";

    if (playerInfo.armor > 0) {
        bonusArmor = `+${playerInfo.armor} Armor\n`;
    }
    if (itemInfo.health > 0) {
        bonusArmor = `+${itemInfo.health} Health`;
    }
    if (itemInfo.strength > 0) {
        bonusStrength = `+${itemInfo.strength} Strength`;
    }
    if (itemInfo.mana > 0) {
        bonusMana = `+${itemInfo.mana} Mana`;
    }

    return new Discord.MessageEmbed()
        .setColor("0xd8eb34")
        .setTitle(`${playerInfo.username}'s Inventory [${playerInfo.class}]`)
        .setThumbnail(playerInfo.image)
        .addFields(
            {name: `❤️ ${playerInfo.health} / ${playerInfo.maxHealth + itemInfo.health}`, value: bonusArmor, inline: true},
            {name: `💪 ${playerInfo.strength + itemInfo.strength}`, value: bonusStrength, inline: true},
            {name: `🧪 ${playerInfo.mana} / ${playerInfo.maxMana + itemInfo.mana}`, value: bonusMana, inline: true},
            {name: `Equiped Armor: ${playerInfo.clothing}`, value: `**Equiped Weapon: ${playerInfo.weapon}**`},
            {name: '|---------SPELLS---------|', value: checkIfExists(playerObj.spells), inline: true},
            {name: `|------TOOLS (${playerInfo.totalInventory}/${playerObj.maxInventory})------|`, value: checkIfExists(playerObj.items), inline: true}
        );
}

function _parsePlayerArrays(arr) {
    if (arr.length === 0) {
        return "None";
    }

    let displayString = "";
    arr.forEach(itemObject => {
        displayString += itemObject.item_name + "\n";
    });

    return displayString;
}

function _parsePlayerItems(playerInfo) {
    playerInfo.totalInventory = 0;
    playerInfo.itemString = _parsePlayerArrays(playerInfo.items);
    playerInfo.items.forEach(itemObject => {
        totalInventory += itemObject.quantity;
    });

    return playerInfo;
}

function _parsePlayerSpells(playerInfo) {
    playerInfo.spellString = _parsePlayerArrays(playerInfo.spells);
    return playerInfo;
}

/**
 * Displays the character information for the player requesting it.
 * @param {string} playerName The name of the player.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function displayPlayerInfo(playerName, gameObject, msg) {
    if (playerName !== msg.author.username && !ui.isHost(gameObject.host, playerName)) {
        return error.error("This is a host only command.", "You cannot view another members inventory.", msg);
    }

    db.getFullPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        if (!playerInfo) return;

        playerInfo = _parsePlayerItems(playerInfo);
        playerInfo = _parsePlayerSpells(playerInfo);

        console.log(playerInfo);
    });

    // msg.author.send({embed: characterInformationEmbed});
}

function _getName(rawInput) {
    let objectName = "";
    for (let i = 1; i < rawInput.length; i++) {
        objectName += rawInput[i] + "_";
    }
    return objectName.slice(0, -1).toLowerCase();
}

function _getGameObjectEmbed(inventoryObject) {
    return new Discord.MessageEmbed()
        .setColor(inventoryObject.color)
        .setTitle(inventoryObject.name)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail(inventoryObject.image)
        .addFields(
            {name: inventoryObject.header, value: inventoryObject.info, inline: true}
        )
        .setFooter(inventoryObject.footer)
}

/**
 * Displays item information in an embed.
 * @param {string} itemName The name of the item.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function itemInfo(rawInput, msg) {
    let itemName = _getName(rawInput);
    if (!items.items[itemName]) return error.error(`\`${itemName}\` does not exist.`, "Check your spelling? (Case insensitive)", msg);

    let itemInfo = items.items[itemName];

    itemInfo.color = 0x7734eb;
    itemInfo.header = `${itemInfo.equipable ? "Equipable" : "Consumable"}`;
    itemInfo.footer = `${itemInfo.equipable ? `!equip ${itemName}` : `!use ${itemName}`}`
    const itemInfoEmbed = _getGameObjectEmbed(itemInfo);
    msg.channel.send(itemInfoEmbed);
}

/**
 * Displays spell information in an embed.
 * @param {string} spellName The name of the spell.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function spellInfo(rawInput, msg) {
    let spellName = _getName(rawInput);
    if (!spells.spells[spellName]) return error.error(`\`${spellName}\` does not exist.`, "Check your spelling? (Case insensitive)", msg);

    let spellInfo = spells.spells[spellName];

    spellInfo.color = 0x34ebab;
    spellInfo.header = `Mana Cost: ${spellInfo.mana}`;
    spellInfo.footer = `!cast ${spellName}`;

    const spellInfoEmbed = _getGameObjectEmbed(spellInfo);
    msg.channel.send(spellInfoEmbed);
}

/**
 * Populates the fields for the embed.
 * @param {string} className The name of the class.
 */
function _getClassFields(className) {
    let fields = [],
        classObject = {};

    switch(className) {
        case "juggernaut":
            classObject.name = "Juggernaut";
            classObject.url = "https://i.imgur.com/ChxDqEE.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 40 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Armor", value: "When you get hit, you will absorb 3 points worth of damage by default. This value can be increased by equiping armor found in the world."};
            fields[4] = {name: "\u200b", value: "This character can endure massive damage. Shrug off even the largest of hits."};
            break;
        case "paladin":
            classObject.name = "Paladin";
            classObject.url = "https://i.imgur.com/BLhcLTS.gif";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 25 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 3 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Melee Damage & +1 Healing", value: "Deal extra damage when you do a melee attack. Improve your healing capabilities whenever you cast a spell or use a potion."};
            fields[4] = {name: "\u200b", value: "Face your foes head on and survive to live another day. Your healing and damage far surpass any enemy you would encouter."};
            break;
        case "assassin":
            classObject.name = "Assassin";
            classObject.url = "https://i.imgur.com/6UANXPh.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 18 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +5 Melee Damage", value: "Deal 5 bonus damage when using your melee weapon!"};
            fields[4] = {name: "\u200b", value: "Use the shadows to your advantage. You know the enemies weakpoints and can perform critical hits with ease. Careful not to fight directly through, you cannot sustain a fight for long."};
            break;
        case "wizard":
            classObject.name = "Wizard";
            classObject.url = "https://i.imgur.com/d5VfPOS.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 15 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 20 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Spell Damage", value: "Deal 3 bonus damage when using a spell!"};
            fields[4] = {name: "\u200b", value: "As a master of the dark arts, you control the elements. Destroy your enemies with overwhelming power. Fight from the rear ranks and use your range to your advantage, a wizard cannot survive for long while they are alone."};
            break;
        case "cleric":
            classObject.name = "Cleric";
            classObject.url = "https://i.imgur.com/AJZas5t.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 17 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 10 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Healing", value: "Heal your allies with a bonus of +3. Also applies to potions when self healing."};
            fields[4] = {name: "\u200b", value: "Use the power of the divine to heal your allies and to vanquish your foes. With you on their team, your friends can never die."};
            break;
        case "archmage":
            classObject.name = "Archmage";
            classObject.url = "https://i.imgur.com/10DmLXk.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 20 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 2 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 10 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +2 Melee Damage & +1 Spell Damage", value: "Deal 3 bonus damage when attacking with a melee weapon and +1 bonus damage when using a spell!"};
            fields[4] = {name: "\u200b", value: "You know the sword as well as the flames. Combat your foes with ranged and melee weapons."};
            break;
        case "bard":
            classObject.name = "Bard";
            classObject.url = "https://i.imgur.com/znRYmxK.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 23 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 4 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Luck", value: "Increase your rolls by 3 when not in combat."};
            fields[4] = {name: "\u200b", value: "People think you\'re nothing but a drunk, but they don\'t realize your secrets. Conquer your foes with your charm... and maybe a hidden knife up your sleeve, who knows what you\'re hiding"};
            break;
    }

    classObject.fields = fields;
    return classObject;
}

function _getClassEmbed(classObject) {
    return new Discord.MessageEmbed()
        .setColor("0xc2f542")
        .setTitle(classObject.name)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail(classObject.url)
        .addFields(classObject.fields)
}

function _getClassMenuEmbed() {
    return new Discord.MessageEmbed()
        .setColor("0xc2f542")
        .setTitle(`Class Menu`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Click 🌐 to return to the home screen.")
        .addFields(
            {name: "🛡️ Juggernaut", value: "\u200b", inline: true},
            {name: "⚔️ Assassin", value: "\u200b", inline: true},
            {name: "🪄 Wizard", value: "\u200b", inline: true},
            {name: "☀️ Paladin", value: "\u200b", inline: true},
            {name: "⚕️ Cleric", value: "\u200b", inline: true},
            {name: "🧙 Archmage", value: "\u200b", inline: true},
            {name: "🎸 Bard", value: "\u200b", inline: true}
        )
}

function classMenuUi(msg) {
    const classMenuEmbed = _getClassMenuEmbed();
    let newEmbed;

    // Send the message and setup emotes.
    msg.channel.send(classMenuEmbed).then(async classEmbed => {
        await classEmbed.react("🛡️");
        await classEmbed.react("⚔️");
        await classEmbed.react("🪄");
        await classEmbed.react("☀️");
        await classEmbed.react("⚕️");
        await classEmbed.react("🧙");
        await classEmbed.react("🎸");
        await classEmbed.react("🌐");

        const filter = (reaction, user) => {
            return ["🛡️","⚔️","🪄","☀️","⚕️","🧙","🎸","🌐"].includes(reaction.emoji.name) && !user.bot;
        }

        // Handle the reactions.
        const collector = classEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "🌐":
                    classEmbed.edit(classMenuEmbed);
                    break;
                case "🛡️":
                    newEmbed = _getClassEmbed(_getClassFields("juggernaut"));
                    classEmbed.edit(newEmbed);
                    break;
                case "⚔️":
                    newEmbed = _getClassEmbed(_getClassFields("assassin"));
                    classEmbed.edit(newEmbed);
                    break;
                case "🪄":
                    newEmbed = _getClassEmbed(_getClassFields("wizard"));
                    classEmbed.edit(newEmbed);
                    break;
                case "☀️":
                    newEmbed = _getClassEmbed(_getClassFields("paladin"));
                    classEmbed.edit(newEmbed);
                    break;
                case "⚕️":
                    newEmbed = _getClassEmbed(_getClassFields("cleric"));
                    classEmbed.edit(newEmbed);
                    break;
                case "🧙":
                    newEmbed = _getClassEmbed(_getClassFields("archmage"));
                    classEmbed.edit(newEmbed);
                    break;
                case "🎸":
                    newEmbed = _getClassEmbed(_getClassFields("bard"));
                    classEmbed.edit(newEmbed);
                    break;
            }
            ui.removeReaction(reaction);
        });
    });
}

exports.itemInfo = itemInfo;
exports.spellInfo = spellInfo;
exports.classMenuUi = classMenuUi;
exports.displayPlayerInfo = displayPlayerInfo;
