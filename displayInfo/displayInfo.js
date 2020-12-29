const Discord = require("discord.js"),
    dice = require("../util/dice"),
    ui = require("../util/UImethods"),
    db = require("../databaseHandler/dbHandler"),
    error = require("../util/error");

/**
 * Displays the journal as a private message to the player.
 * @param {array} JournalInfo The journal object array.
 * @param {string} playerName Name of the player.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function displayJournal(journalInfo, playerName, msg) {
    let fields = [];
    let index = 0;

    journalInfo.forEach(entry => {
        fields[index++] = {name: entry.entry_name, value: entry.description};
    });
    if (!fields[0])
        fields[0] = {name: "The pages are all torn up and you can\'t make out any of the notes. At least future additions will be easier to read.", value: "`!add-note -<entry name> -<description>`\nDon't forget the `-`'s!"};

    let journal = new Discord.MessageEmbed()
        .setColor("0x32a8a4")
        .setTitle(`${playerName}'s Journal (${journalInfo.length}/25)`)
        .setThumbnail("https://i.imgur.com/XYraIdT.png")
        .addFields(fields);

    msg.author.send(journal);
    msg.react("✅");
}

/**
 * Display information when a player casts a spell.
 * @param {object} playerInfo The player information.
 * @param {object} spellInfo The spell information.
 * @param {int} amount The amount of damage that was caused.
 * @param {int} roll The roll value (if the spell included a roll).
 * @param {int} enemyArmor The enemy armor class value.
 * @param {string} enemyName The enemy name.
 * @param {object} msg The discord message object.
 */
function castInfo(playerInfo, spellInfo, amount, roll, enemyArmor, enemyName, msg) {
    let nameString = "\u200b";
    let valueString = "\u200b";

    // Modifies the strings so that they display information about dice rolls and damage including any buffs to spell/healing power.
    if (spellInfo.bonus_roll) valueString += `Roll: D${spellInfo.bonus_roll} (${roll})\n`;
    if (spellInfo.type === "attack") {
        nameString = `Total Damage Dealt with ${spellInfo.spell_name}: \`${amount}\``;
        valueString += `Spell Damage: ${spellInfo.damage}\nEnemy Armor: ${enemyArmor}\nBonus Spell Damage: ${playerInfo.bonusSpell}`;
        if (spellInfo.bonus_roll) {
            valueString += `\n\`Calculation: ${roll} + ${spellInfo.damage} - ${enemyArmor} + ${playerInfo.bonusSpell}\``;
        } else {
            valueString += `\n\`Calculation: ${spellInfo.damage} - ${enemyArmor} + ${playerInfo.bonusSpell}\``;
        }
    } else if (spellInfo.type === "healing") {
        nameString = `Total Healing with ${spellInfo.spell_name}: \`${amount}\``;
        valueString += `Spell Healing: ${spellInfo.healing}\nBonus Healing: ${playerInfo.bonusHealing}`;
        if (spellInfo.bonus_roll) {
            valueString += `\n\`Calculation: ${roll} + ${spellInfo.healing} + ${playerInfo.bonusHealing}\``;
        } else {
            valueString += `\n\`Calculation: ${spellInfo.healing} + ${playerInfo.bonusHealing}\``;
        }
    }

    let spellEmbed = new Discord.MessageEmbed()
        .setColor("0xfc03b1")
        .setTitle(`${playerInfo.username} casts ${spellInfo.spell_name} on ${enemyName}`)
        .setThumbnail(spellInfo.image)
        .addFields(
            {name: nameString, value: valueString}
        );

    return msg.channel.send(spellEmbed);
}

/**
 * Display information when a player attacks with their melee weapon.
 * @param {object} playerInfo The player information.
 * @param {string} enemyName The enemy name.
 * @param {object} itemInfo The item information.
 * @param {int} damageRoll The amount of damage done from rolling the dice.
 * @param {object} msg The discord message object.
 */
function attackInfo(playerInfo, enemyName, itemInfo, damageRoll, msg) {
    let attackEmbed = new Discord.MessageEmbed()
        .setColor("0x995e06")
        .setTitle(`${playerInfo.username} breaks through ${enemyName}'s armor!`)
        .setThumbnail(itemInfo.image)
        .addFields(
            {name: `Total Damage Dealt: \`${damageRoll}\``, value: `D${itemInfo.damage_dice} (${damageRoll})`}
        );

    msg.channel.send(attackEmbed);
}

/**
 * Get the full player information embed including hp/mp/str + equiped items + spells + tools + money.
 * @param {object} playerInfo Player information object.
 * @param {object} weaponInfo Weapon information object.
 * @param {object} clothingInfo Clothing information object.
 */
function _getPlayerInfoEmbed(playerInfo, weaponInfo, clothingInfo) {
    let bonusArmor = "\u200b";
    let bonusSpells = "\u200b";

    if (playerInfo.armor > 0)
        bonusArmor = `Total Armor: ${playerInfo.armor}`;
    if (playerInfo.bonusSpell)
        bonusSpells += `Spell Damage Boost: ${playerInfo.bonusSpell}\n`;
    if (playerInfo.bonusHealing)
        bonusSpells += `Healing Boost: ${playerInfo.bonusHealing}`;

    let itemBonuses = _getItemBonus(weaponInfo);
    let clothingBonuses = _getItemBonus(clothingInfo);

    return new Discord.MessageEmbed()
        .setColor("0xd8eb34")
        .setTitle(`${playerInfo.username}'s Inventory [${playerInfo.class}]`)
        .setThumbnail(playerInfo.image)
        .addFields(
            {name: `❤️ ${playerInfo.health} / ${playerInfo.maxHealth}`, value: bonusArmor, inline: true},
            {name: `💪 ${playerInfo.strength}`, value: "\u200b", inline: true},
            {name: `🧪 ${playerInfo.mana} / ${playerInfo.maxMana}`, value: bonusSpells, inline: true},
            {name: `🥼: ${playerInfo.clothing}`, value: clothingBonuses, inline: true},
            {name: `🗡️: ${playerInfo.weapon}`, value: itemBonuses, inline: true},
            {name: `:coin: ${playerInfo.money}`, value: "\u200b", inline: true},
            {name: "\u200b", value: "\u200b"},
            {name: "]---SPELLS---[", value: playerInfo.spellList, inline: true},
            {name: `]---TOOLS (${playerInfo.occupiedInventory}/${playerInfo.maxInventory})---[`, value: playerInfo.itemString, inline: true}
        );
}

/**
 * Returns a string of bonuses that the item has.
 * @param {object} itemInfo The item information object.
 */
function _getItemBonus(itemInfo) {
    let bonusList = "";
    if (itemInfo.bonusHealth) bonusList += `+ ${itemInfo.bonusHealth} Health\n`;
    if (itemInfo.bonusMana) bonusList += `+ ${itemInfo.bonusMana} Mana\n`;
    if (itemInfo.bonusStrength) bonusList += `+ ${itemInfo.bonusStrength} Strength\n`;
    if (itemInfo.bonusSpell) bonusList += `+ ${itemInfo.bonusSpell} Spell Damage\n`;
    if (itemInfo.bonusHealing) bonusList += `+ ${itemInfo.bonusHealing} Healing Power\n`;
    if (itemInfo.bonusArmor) bonusList += `+ ${itemInfo.bonusArmor} Armor\n`;
    if (itemInfo.bonusLuck) bonusList += `+ ${itemInfo.bonusLuck} Luck`;
    return (bonusList === "") ? "- No Bonuses" : bonusList;
}

/**
 * Sets up the list of items so that they are displayed in the proper format on the inventory embed.
 * @param {object} playerInfo The player information object.
 */
function _parsePlayerItems(playerInfo) {
    playerInfo.occupiedInventory = 0;
    playerInfo.itemString = "";

    if (playerInfo.items.length === 0) {
        playerInfo.itemString = "None";
    } else {
        playerInfo.items.forEach(itemObject => {
            playerInfo.itemString += `${itemObject.quantity}: ${itemObject.item_name}\n`;
            playerInfo.occupiedInventory += itemObject.quantity;
        });
    }

    return playerInfo;
}

/**
 * Sets up the list of spells so that they are displayed in the proper format on the inventory embed.
 * @param {object} playerInfo The player information object.
 */
function _parsePlayerSpells(playerInfo) {
    playerInfo.spellList = [];

    if (playerInfo.spells.length === 0) {
        playerInfo.spellList = "None";
    } else {
        playerInfo.spells.forEach(spellInfo => {
            playerInfo.spellList.push(spellInfo.spell_name);
        });
    }

    return playerInfo;
}

/**
 * Displays the character information in a embed and sent as a DM.
 * @param {string} playerName The name of the player.
 * @param {object} gameObject The game object.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function playerInfo(playerName, gameObject, msg) {
    if (playerName !== msg.author.username && !ui.isHost(gameObject.host, playerName)) {
        return error.error("This is a host only command.", "You cannot view another members inventory.", msg);
    }

    db.getFullPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        db.getItemInfo(playerInfo.weapon, false, msg, weaponInfo => {
            db.getItemInfo(playerInfo.clothing, false, msg, clothingInfo => {
                playerInfo = _parsePlayerItems(playerInfo);
                playerInfo = _parsePlayerSpells(playerInfo);

                let inventoryEmbed = _getPlayerInfoEmbed(playerInfo, weaponInfo, clothingInfo);
                msg.author.send(inventoryEmbed);
            });
        });
    });
}

/**
 * Displays the dice roll.
 * @param {int} diceSize The value from the dice roll.
 * @param {string} gameName The game name.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function diceRoll(diceSize=20, gameName, msg) {
    db.getBasicPlayerInfo(msg.author.username, gameName, msg, playerInfo => {
        let imageURL = "https://imgur.com/JYyQ1Xd.png";
        let footerText = " ";
        let luck = false;

        let roll = dice.roll(diceSize);
        if (roll == diceSize) {
            imageURL = "https://imgur.com/YV7Amj7.png";
        } else if (roll === 1) {
            imageURL = "https://i.imgur.com/4EAe8y6.png";
        }

        let finalRoll = roll + playerInfo.luck;
        if (finalRoll > diceSize)
            finalRoll = diceSize;

        if (playerInfo.luck > 0) {
            footerText = "Bonus luck has been applied!";
            luck = true;
        }

        let diceEmbed = new Discord.MessageEmbed()
            .setColor("0xa8a632")
            .setTitle(`${playerInfo.username} rolls a ${finalRoll}`)
            .setThumbnail(imageURL)
            .addFields(
                {name: `\u200b`, value: `D${diceSize} (${roll}) ${(luck) ? `+ ${playerInfo.luck}` : ''}`, inline: true}
            )
            .setFooter(footerText);
        msg.channel.send(diceEmbed);
    });
}

/**
 * A generic game object display embed. Displays items and spells.
 * @param {object} inventoryObject The item/spell object.
 */
function _getGameObjectEmbed(inventoryObject) {
    return new Discord.MessageEmbed()
        .setColor(inventoryObject.color)
        .setTitle(inventoryObject.name)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail(inventoryObject.image)
        .addFields(
            {name: inventoryObject.header, value: inventoryObject.description},
            {name: inventoryObject.bonusHeader, value: inventoryObject.bonuses}
        )
        .setFooter(inventoryObject.footer)
}

/**
 * Displays item information in an embed.
 * @param {array} rawInput User input.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function itemInfo(rawInput, msg) {
    let itemName = ui.getName(rawInput);
    db.getItemInfo(itemName, false, msg, itemInfo => {
        itemInfo.name = itemInfo.item_name;
        itemInfo.color = 0x7734eb;
        itemInfo.header = "";
        if (itemInfo.weapon && itemInfo.equipable) itemInfo.header += "🗡️ Equipable";
        if (!itemInfo.weapon && itemInfo.equipable) itemInfo.header += "🥼 Equipable";
        if (itemInfo.consumable) itemInfo.header += "🍞 Consumable";
        itemInfo.footer = `${itemInfo.equipable ? `!equip ${itemName}` : `!use ${itemName}`}`;
        itemInfo.bonusHeader = "Bonuses:"
        itemInfo.bonuses = _getItemBonus(itemInfo);

        const itemInfoEmbed = _getGameObjectEmbed(itemInfo);
        msg.channel.send(itemInfoEmbed);
    });
}

/**
 * Displays spell information in an embed.
 * @param {array} rawInput User input.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function spellInfo(rawInput, msg) {
    let spellName = ui.getName(rawInput);
    db.getSpellInfo(spellName, false, msg, spellInfo => {
        spellInfo.name = spellInfo.spell_name;
        spellInfo.color = 0x34ebab;
        spellInfo.header = `Mana Cost: ${spellInfo.mana_cost}`;
        spellInfo.footer = `!cast ${spellName}`;

        if (spellInfo.type === "attack") {
            spellInfo.bonusHeader = "☠️ Attack Spell";
            spellInfo.bonuses = `Deals ${spellInfo.damage} damage ${(spellInfo.bonus_roll) ? `+ D(${spellInfo.bonus_roll})` : ""}`;
        } else if (spellInfo.type === "healing") {
            spellInfo.bonusHeader = "👼🏼 Healing Spell";
            spellInfo.bonuses = `Heals ${spellInfo.healing} health ${(spellInfo.bonus_roll) ? `+ D(${spellInfo.bonus_roll})` : ""}`;
        } else {
            spellInfo.bonusHeader = "🪄 Misc Spell";
            spellInfo.bonuses = `${(spellInfo.bonus_roll) ? `Roll a D(${spellInfo.bonus_roll})` : "\u200b"}`;
        }

        const spellInfoEmbed = _getGameObjectEmbed(spellInfo);
        msg.channel.send(spellInfoEmbed);
    });
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
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Armor", value: "Start off with three extra points into your Armor Class. This value can be increased by equiping armor found in the world."};
            fields[4] = {name: "\u200b", value: "This character can endure massive damage. Shrug off even the largest of hits."};
            break;
        case "paladin":
            classObject.name = "Paladin";
            classObject.url = "https://i.imgur.com/BLhcLTS.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 25 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 8 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Strength & +1 Healing", value: "Start off with 3 extra strength and improve your healing capabilities whenever you cast a spell or use a potion."};
            fields[4] = {name: "\u200b", value: "Face your foes head on and survive to live another day. Your healing and damage far surpass any enemy you would encouter."};
            break;
        case "assassin":
            classObject.name = "Assassin";
            classObject.url = "https://i.imgur.com/6UANXPh.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 18 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 10 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +5 Strength", value: "Starts off with 5 extra strength! This character starts with the highest strength value and it be increased by equiping armor and weapons found throughout the world."};
            fields[4] = {name: "\u200b", value: "Use the shadows to your advantage. You know the enemies weakpoints and can perform critical hits with ease. Careful not to fight directly through, you cannot sustain a fight for long."};
            break;
        case "wizard":
            classObject.name = "Wizard";
            classObject.url = "https://i.imgur.com/d5VfPOS.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 15 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 20 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Spell Damage", value: "Deal 3 bonus damage when using a spell!"};
            fields[4] = {name: "\u200b", value: "As a master of the dark arts, you control the elements. Destroy your enemies with overwhelming power. Fight from the rear ranks and use your range to your advantage, a wizard cannot survive for long while they are alone."};
            break;
        case "cleric":
            classObject.name = "Cleric";
            classObject.url = "https://i.imgur.com/AJZas5t.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 17 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 10 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Healing", value: "Heal your allies with a bonus of +3. Also applies to potions when self healing."};
            fields[4] = {name: "\u200b", value: "Use the power of the divine to heal your allies and to vanquish your foes. With you on their team, your friends can never die."};
            break;
        case "archmage":
            classObject.name = "Archmage";
            classObject.url = "https://i.imgur.com/10DmLXk.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 20 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 7 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 10 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +2 Strength & +1 Spell Damage", value: "Start off with 2 bonus strength and +1 bonus damage when using a spell!"};
            fields[4] = {name: "\u200b", value: "You know the sword as well as the flames. Combat your foes with ranged and melee weapons."};
            break;
        case "bard":
            classObject.name = "Bard";
            classObject.url = "https://i.imgur.com/znRYmxK.png";
            fields[0] = {name: "|------- ❤️ -------|", value: `|‾‾‾‾‾‾( 23 )‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: "|------- 💪 -------|", value: `|‾‾‾‾‾‾‾( 5 )‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: "|------- 🧪 -------|", value: `|‾‾‾‾‾‾‾( 4 )‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: "Bonus: +3 Luck", value: "Increase your rolls by 3 when not in combat."};
            fields[4] = {name: "\u200b", value: "People think you\'re nothing but a drunk, but they don\'t realize your secrets. Conquer your foes with your charm... and maybe a hidden knife up your sleeve, who knows what you\'re hiding"};
            break;
    }

    classObject.fields = fields;
    return classObject;
}

/**
 * Gets the class specific embed.
 * @param {object} classObject The class object.
 */
function _getClassEmbed(classObject) {
    return new Discord.MessageEmbed()
        .setColor("0xc2f542")
        .setTitle(classObject.name)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail(classObject.url)
        .addFields(classObject.fields)
        .setFooter("This menu will timeout in 5 minutes.")
}

/**
 * Displays a UI allowing players to see detailed information about classes.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function classMenuUi(msg) {
    let newEmbed;
    const classMenuEmbed = new Discord.MessageEmbed()
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
        );

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
        const collector = classEmbed.createReactionCollector(filter, {time: 300000});
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
exports.playerInfo = playerInfo;
exports.diceRoll = diceRoll;
exports.attackInfo = attackInfo;
exports.displayJournal = displayJournal;
exports.castInfo = castInfo;
