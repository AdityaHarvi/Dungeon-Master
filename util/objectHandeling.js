const Discord = require("discord.js"),
    ui = require("./UImethods"),
    error = require("./error"),
    db = require("../databaseHandler/dbHandler");

const page = {
    DICE_SELECTION: "damage_dice",
    HEALTH_SELECTION: "bonusHealth",
    STRENGTH_SELECTION: "bonusStrength",
    MANA_SELECTION: "bonusMana",
    ARMOR_SELECTION: "bonusArmor",
    SPELL_SELECTION: "bonusSpell",
    HEALING_SELECTION: "bonusHealing",
    LUCK_SELECTION: "bonusLuck",
    INVENTORY_SELECTION: "bonusInventory",
    MONEY_SELECTION: "bonusMoney"
};

const spellPage = {
    MANA_SELECTION: "mana_cost",
    DAMAGE_SELECTION: "damage",
    HEALING_SELECTION: "healing",
    DICE_SELECTION: "bonus_roll"
}

const emojiValue = {
    0: "1️⃣",
    1: "2️⃣",
    2: "3️⃣",
    3: "4️⃣",
    4: "5️⃣",
    5: "6️⃣",
    6: "7️⃣",
    7: "8️⃣",
    8: "9️⃣"
}

/**
 * Returns a embed used in the item & spell creation UI.
 * @param {object} newInfo The incomming information used to update the embed.
 * @param {string} type Whether to display item or spell information.
 */
function _getEmbed(newInfo, type) {
    return new Discord.MessageEmbed()
        .setColor("0x32a8a4")
        .setTitle(`Creating new ${type}: \`${newInfo.name}\``)
        .setThumbnail((newInfo.image) ? newInfo.image :"https://imgur.com/UDtz5TK.png")
        .setDescription(newInfo.helperDescription)
        .addFields(newInfo.fields)
        .setFooter("Click 🗑️ to cancel the process.\nThis menu will timout in 5 minutes.");
}

/**
 * Modifies the value on the embed.
 * @param {object} obj The item/spell object.
 * @param {int} amountToChange The amount to change the value by.
 * @param {object} itemCreationEmbed The embed to modify.
 * @param {object} reaction The reaction to remove.
 * @param {string} type Item/spell.
 */
function _handleValueChange(obj, amountToChange, itemCreationEmbed, reaction, type) {
    (type === "item") ?
        obj = _getItemPageText(obj) :
        obj = _getSpellPageText(obj);

    obj.valueSelection += amountToChange;
    if (obj.valueSelection < 0)
        obj.valueSelection = 0;

    obj.fields[0] = {name: obj.headerText + `: \`${obj.valueSelection}\``, value: "\u200b"};
    let newEmbed = _getEmbed(obj, type);
    itemCreationEmbed.edit(newEmbed);

    ui.removeReaction(reaction);

    return obj;
}

/**
 * Displays a menu allowing the host to modify the to-be-created spell/item stats.
 * @param {object} creationEmbed The embed to modify.
 * @param {object} obj The item/spell object.
 * @param {string} type Item/spell.
 */
function _getModificationSetup(creationEmbed, obj, type) {
    creationEmbed.reactions.removeAll().catch(error => console.error("Failed to clear reactions: ", error));

    obj.fields = [];
    obj.fields[0] = {name: obj.headerText + `: \`${obj.valueSelection}\``, value: "\u200b"};
    obj.fields[1] = {name: "⬆️ Increase by 1", value: "⬇️ **Decrease by 1**", inline: true};
    obj.fields[2] = {name: "⏫ Increase by 5", value: "⏬ **Decrease by 5**", inline: true};
    obj.fields[3] = {name: "➡️ Confirm & go to next", value: "\u200b", inline: true};

    let embed = _getEmbed(obj, type);
    creationEmbed.edit(embed);
    creationEmbed.react("⬆️");
    creationEmbed.react("⏫");
    creationEmbed.react("⬇️");
    creationEmbed.react("⏬");
    creationEmbed.react("➡️");
    creationEmbed.react("🗑️");

    return obj;
}

/**
 * Handles changing the screen information for item creation.
 * @param {object} itemCreationEmbed The item creation embed.
 * @param {object} itemObject The item object.
 * @param {object} reaction The reaction to remove.
 */
function _getNextItemScreen(itemCreationEmbed, itemObject, reaction) {
    itemObject[itemObject.page] = itemObject.valueSelection;
    itemObject.valueSelection = 0;

    switch (itemObject.page) {
        case page.DICE_SELECTION:
            itemObject.page = page.HEALTH_SELECTION;
            break;
        case page.HEALTH_SELECTION:
            itemObject.page = page.STRENGTH_SELECTION;
            break;
        case page.STRENGTH_SELECTION:
            itemObject.page = page.MANA_SELECTION;
            break;
        case page.MANA_SELECTION:
            itemObject.page = page.ARMOR_SELECTION;
            break;
        case page.ARMOR_SELECTION:
            itemObject.page = page.SPELL_SELECTION;
            break;
        case page.SPELL_SELECTION:
            itemObject.page = page.HEALING_SELECTION;
            break;
        case page.HEALING_SELECTION:
            itemObject.page = page.LUCK_SELECTION;
            break;
        case page.LUCK_SELECTION:
            if (itemObject.weapon) {
                itemObject.creationComplete = true;
                return itemObject;
            }
            itemObject.page = page.INVENTORY_SELECTION;
            break;
        case page.INVENTORY_SELECTION:
            itemObject.page = page.MONEY_SELECTION;
            break;
        case page.MONEY_SELECTION:
            itemObject.creationComplete = true;
            return itemObject;
    }

    ui.removeReaction(reaction);
    itemObject = _getItemPageText(itemObject);
    itemObject.fields[0] = {name: itemObject.headerText + `: \`${itemObject.valueSelection}\``, value: "\u200b"};
    let itemEmbed = _getEmbed(itemObject, "item");
    itemCreationEmbed.edit(itemEmbed);
    return itemObject;
}

/**
 * Modifies the text on the embed depending on the screen.
 * @param {object} itemObject The item object.
 */
function _getItemPageText(itemObject) {
    switch (itemObject.page) {
        case page.DICE_SELECTION:
            itemObject.helperDescription = "How much damage will this item be capable of?";
            itemObject.headerText = "Current Dice Size";
            break;
        case page.HEALTH_SELECTION:
            itemObject.helperDescription = "How much will this item boost player health?";
            itemObject.headerText = "Current Health Boost";
            break;
        case page.STRENGTH_SELECTION:
            itemObject.helperDescription = "How much will this item boost player strength?";
            itemObject.headerText = "Current Strength Boost";
            break;
        case page.MANA_SELECTION:
            itemObject.helperDescription = "How much will this item boost player mana?";
            itemObject.headerText = "Current Mana Boost";
            break;
        case page.ARMOR_SELECTION:
            itemObject.helperDescription = "How much will this item boost player armor?";
            itemObject.headerText = "Current Armor Boost";
            break;
        case page.SPELL_SELECTION:
            itemObject.helperDescription = "How much will this item boost player spell?";
            itemObject.headerText = "Current Spell Boost";
            break;
        case page.HEALING_SELECTION:
            itemObject.helperDescription = "How much will this item boost player healing?";
            itemObject.headerText = "Current Healing Boost";
            break;
        case page.LUCK_SELECTION:
            itemObject.helperDescription = "How much will this item boost player luck?";
            itemObject.headerText = "Current Luck Boost";
            break;
        case page.INVENTORY_SELECTION:
            itemObject.helperDescription = "Will the player gain any inventory space from using this item?";
            itemObject.headerText = "Current Inventory Boost";
            break;
        case page.MONEY_SELECTION:
            itemObject.helperDescription = "Will the player get any money from using this item?";
            itemObject.headerText = "Current Money Boost";
            break;
    }
    return itemObject;
}

/**
 * Handles changing the screen information for spell creation.
 * @param {object} spellCreationEmbed Spell creation embed.
 * @param {object} spellObject The spell object.
 * @param {object} reaction The reaction to remove.
 */
function _getNextSpellScreen(spellCreationEmbed, spellObject, reaction) {
    spellObject[spellObject.page] = spellObject.valueSelection;
    spellObject.valueSelection = 0;

    switch (spellObject.page) {
        case spellPage.MANA_SELECTION:
            if (spellObject.type === "attack") {
                spellObject.page = spellPage.DAMAGE_SELECTION;
            } else if (spellObject.type === "healing") {
                spellObject.page = spellPage.HEALING_SELECTION;
            } else {
                spellObject.page = spellPage.DICE_SELECTION;
            }
            break;
        case spellPage.DAMAGE_SELECTION:
            spellObject.page = spellPage.DICE_SELECTION;
            break;
        case spellPage.HEALING_SELECTION:
            spellObject.page = spellPage.DICE_SELECTION;
            break;
        case spellPage.DICE_SELECTION:
            spellObject.creationComplete = true;
            return spellObject;
    }

    ui.removeReaction(reaction);
    spellObject = _getSpellPageText(spellObject);
    spellObject.fields[0] = {name: spellObject.headerText + `: \`${spellObject.valueSelection}\``, value: "\u200b"};
    let spellEmbed = _getEmbed(spellObject, "spell");
    spellCreationEmbed.edit(spellEmbed);
    return spellObject;
}

/**
 * Handles changing the text depending on the screen for a spell.
 * @param {object} spellObject The spell object.
 */
function _getSpellPageText(spellObject) {
    switch (spellObject.page) {
        case spellPage.MANA_SELECTION:
            spellObject.helperDescription = "What is the mana cost for this spell?";
            spellObject.headerText = "Current Mana Cost";
            break;
        case spellPage.DAMAGE_SELECTION:
            spellObject.helperDescription = "How much damage does this spell do?";
            spellObject.headerText = "Current Damage";
            break;
        case spellPage.HEALING_SELECTION:
            spellObject.helperDescription = "How much does this spell heal for?";
            spellObject.headerText = "Current Healing Amount";
            break;
        case spellPage.DICE_SELECTION:
            spellObject.helperDescription = "Do you want to add on a dice roll to the spell?";
            spellObject.headerText = "Current Dice Size";
            break;
    }
    return spellObject;
}

/**
 * Validates the input.
 * @param {object} parsedCommand The parsed command.
 * @param {string} itemOrSpell Item/spell.
 * @param {object} msg The discord message object.
 */
function _isCorrectFormat(parsedCommand, itemOrSpell, msg) {
    if (ui.isImgurLink(parsedCommand[1])) {
        error.error("The name should not be a link.", `\`!make-${itemOrSpell} -<${itemOrSpell} name> -<description> -<imgur link: optional>\``, msg);
        return false;
    } else if (ui.isImgurLink(parsedCommand[2])) {
        error.error("The description should not be a link.", `\`!make-${itemOrSpell} -<${itemOrSpell} name> -<description> -<imgur link: optional>\``, msg);
        return false;
    } else if (parsedCommand[3] && !ui.isImgurLink(parsedCommand[3])) {
        error.error("The last input should be an imgur link ending with `.png` or `.gif`.", `\`!make-${itemOrSpell} -<${itemOrSpell} name> -<description> -<imgur link: optional>\``, msg);
        return false;
    }
    return true;
}

/**
 * Creates a UI allowing the host to create a new item.
 * @param {array} rawInput The raw user input split into an array.
 * @param {int} hostChannel The host channel.
 * @param {object} msg The discord message object.
 */
function items(rawInput, hostChannel, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    if (dashAmount < 2 || dashAmount > 3)
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the item name and description.\n`!make-item -<item name> -<description> -<imgur link: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[1].includes("-"))
        return error.error("Please don't use a `-` in the name.", undefined, msg);
    if (!isNaN(parsedCommand[1]))
        return error.error("An item name cannot only consist of numbers.", undefined, msg);
    if (!_isCorrectFormat(parsedCommand, "item", msg))
        return;

    db.getItemInfo(parsedCommand[1], true, msg, itemExists => {
        if (itemExists)
            return error.error("An item with that name already exists.", undefined, msg);

        let itemObject = {};
        itemObject.name = parsedCommand[1];
        itemObject.description = parsedCommand[2];
        itemObject.equipable = 0;
        itemObject.consumable = 0;
        itemObject.image = (parsedCommand[3]) ? parsedCommand[3] : null;
        itemObject.damage_dice = 0;
        itemObject.weapon = 0;
        itemObject.bonusHealth = 0;
        itemObject.bonusStrength = 0;
        itemObject.bonusMana = 0;
        itemObject.bonusArmor = 0;
        itemObject.bonusSpell = 0;
        itemObject.bonusHealing = 0;
        itemObject.bonusLuck = 0;
        itemObject.bonusInventory = 0;
        itemObject.bonusMoney = 0;

        itemObject.helperDescription = "Do you want to create an equipable, consumable, or misc item? You can only pick one.";
        itemObject.fields = [];
        itemObject.fields[0] = {name: "1️⃣ Equipable", value: "Players can `!equip` the item.", inline: true};
        itemObject.fields[1] = {name: "2️⃣ Consumable", value: "Players can `!use` the item.", inline: true};
        itemObject.fields[2] = {name: "3️⃣ Misc", value: "Players can do nothing (command-wise) with this item.", inline: true};
        itemObject.valueSelection = 0;
        itemObject.page = page.DICE_SELECTION;
        itemObject.creationComplete = false;

        let itemEmbed = _getEmbed(itemObject, "item");

        // Set the message and setup emotes.
        msg.client.channels.cache.get(hostChannel).send(itemEmbed).then(async itemCreationEmbed => {
            await itemCreationEmbed.react("1️⃣");
            await itemCreationEmbed.react("2️⃣");
            await itemCreationEmbed.react("3️⃣");
            await itemCreationEmbed.react("🗑️");

            const filter = (reaction, user) => {
                return ["1️⃣", "2️⃣", "3️⃣", "🗡️", "🥼", "⬆️", "⏫", "⬇️", "⏬", "➡️", "🗑️"].includes(reaction.emoji.name) && !user.bot;
            }

            // Handle the reactions.
            const collector = itemCreationEmbed.createReactionCollector(filter, {time: 300000});
            collector.on('collect', reaction => {
                switch (reaction.emoji.name) {
                    case "1️⃣":
                        itemObject.equipable = 1;
                        itemCreationEmbed.reactions.removeAll().catch(error => console.error("Failed to clear reactions: ", error));
                        itemObject.helperDescription = "Is this a weapon or piece of armor?";
                        itemObject.fields = [];
                        itemObject.fields[0] = {name: "🗡️ Weapon", value: "Players can equip this as part of their weapon slot.", inline: true};
                        itemObject.fields[1] = {name: "🥼 Armor", value: "Players can equip this as part of their armor slot.", inline: true};
                        itemEmbed = _getEmbed(itemObject, "item");
                        itemCreationEmbed.edit(itemEmbed);
                        itemCreationEmbed.react("🗡️");
                        itemCreationEmbed.react("🥼");
                        itemCreationEmbed.react("🗑️");
                        break;
                    case "2️⃣":
                        itemObject.consumable = 1;
                        itemObject.page = page.HEALTH_SELECTION;
                        itemObject = _getItemPageText(itemObject);
                        itemObject = _getModificationSetup(itemCreationEmbed, itemObject, "item");
                        break;
                    case "3️⃣":
                        itemCreationEmbed.delete();
                        db.newItem(itemObject, () => {
                            msg.channel.send(`New item \`${itemObject.name}\` has been created!`);
                        });
                        return;
                    case "🗡️":
                        itemObject.weapon = 1;
                        itemObject.page = page.DICE_SELECTION;
                        itemObject = _getItemPageText(itemObject);
                        itemObject = _getModificationSetup(itemCreationEmbed, itemObject, "item");
                        break;
                    case "🥼":
                        itemObject.page = page.HEALTH_SELECTION;
                        itemObject = _getItemPageText(itemObject);
                        itemObject = _getModificationSetup(itemCreationEmbed, itemObject, "item");
                        break;
                    case "⬆️":
                        itemObject = _handleValueChange(itemObject, 1, itemCreationEmbed, reaction, "item");
                        break;
                    case "⏫":
                        itemObject = _handleValueChange(itemObject, 5, itemCreationEmbed, reaction, "item");
                        break;
                    case "⬇️":
                        itemObject = _handleValueChange(itemObject, -1, itemCreationEmbed, reaction, "item");
                        break;
                    case "⏬":
                        itemObject = _handleValueChange(itemObject, -5, itemCreationEmbed, reaction, "item");
                        break;
                    case "➡️":
                        itemObject = _getNextItemScreen(itemCreationEmbed, itemObject, reaction);
                        if (itemObject.creationComplete) {
                            itemCreationEmbed.delete();
                            db.newItem(itemObject, () => {
                                msg.channel.send(`New item \`${itemObject.name}\` has been created!`);
                            });
                            return;
                        }
                        break;
                    case "🗑️":
                        itemCreationEmbed.delete();
                        msg.channel.send("Item creation cancelled.");
                        return;
                }
            });
        });
    });
}

/**
 * Delete's item from the database.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} msg The discord message object.
 */
function deleteItem(rawInput, msg) {
    let itemName = ui.getName(rawInput);
    db.deleteItem(itemName, msg);
}

/**
 * Creates a UI allowing the host to create a new spells.
 * @param {array} rawInput The raw user input split into an array.
 * @param {int} hostChannel The host channel.
 * @param {object} msg The discord message object.
 */
function spells(rawInput, hostChannel, msg) {
    if (ui.dashAmount(rawInput) !== 2)
        return error.error("Incorrect command format.", "This command is a little funky. Don't forget the `-` before the spell name and description.\n`!make-spell -<spell name> -<description> -<imgur link: optional>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].replace(/ /g, "_").toLowerCase();

    if (parsedCommand[1].includes("-"))
        return error.error("Please don't use a `-` in the name.", undefined, msg);
    if (!isNaN(parsedCommand[1]))
        return error.error("A spell name cannot only consist of numbers.", undefined, msg);
    if (!_isCorrectFormat(parsedCommand, "spell", msg))
        return;

    db.getSpellInfo(parsedCommand[1], true, msg, spellExists => {
        if (spellExists)
            return error.error("An spell with that name already exists.", undefined, msg);

        let spellObject = {};
        spellObject.name = parsedCommand[1];
        spellObject.description = parsedCommand[2];
        spellObject.type = "attack";
        spellObject.image = (parsedCommand[3]) ? parsedCommand[3] : null;
        spellObject.mana_cost = 0;
        spellObject.healing = 0;
        spellObject.damage = 0;
        spellObject.bonus_roll = 0;

        spellObject.helperDescription = "Do you want to create an Attack, Healing, or Misc spell? You can only pick one.";
        spellObject.fields = [];
        spellObject.fields[0] = {name: "1️⃣ Attack", value: "This spell will damage the opponent.", inline: true};
        spellObject.fields[1] = {name: "2️⃣ Healing", value: "This spell will heal the targetted opponent.", inline: true};
        spellObject.fields[2] = {name: "3️⃣ Misc", value: "This spell cannot attack nor heal the opponent but may server other purposes.", inline: true};
        spellObject.valueSelection = 0;
        spellObject.page = spellPage.MANA_SELECTION;
        spellObject.creationComplete = false;

        let spellEmbed = _getEmbed(spellObject, "spell");

        // Set the message and setup emotes.
        msg.client.channels.cache.get(hostChannel).send(spellEmbed).then(async spellCreationEmbed => {
            await spellCreationEmbed.react("1️⃣");
            await spellCreationEmbed.react("2️⃣");
            await spellCreationEmbed.react("3️⃣");
            await spellCreationEmbed.react("🗑️");

            const filter = (reaction, user) => {
                return ["1️⃣", "2️⃣", "3️⃣", "⬆️", "⏫", "⬇️", "⏬", "➡️", "🗑️"].includes(reaction.emoji.name) && !user.bot;
            }

            // Handle the reactions.
            const collector = spellCreationEmbed.createReactionCollector(filter, {time: 300000});
            collector.on('collect', reaction => {
                switch (reaction.emoji.name) {
                    case "1️⃣":
                        spellObject.type = "attack";
                        spellObject = _getSpellPageText(spellObject);
                        spellObject = _getModificationSetup(spellCreationEmbed, spellObject, "spell");
                        break;
                    case "2️⃣":
                        spellObject.type = "healing";
                        spellObject = _getSpellPageText(spellObject);
                        spellObject = _getModificationSetup(spellCreationEmbed, spellObject, "spell");
                        break;
                    case "3️⃣":
                        spellObject.type = "misc";
                        spellObject = _getSpellPageText(spellObject);
                        spellObject = _getModificationSetup(spellCreationEmbed, spellObject, "spell");
                        return;
                    case "⬆️":
                        spellObject = _handleValueChange(spellObject, 1, spellCreationEmbed, reaction, "spell");
                        break;
                    case "⏫":
                        spellObject = _handleValueChange(spellObject, 5, spellCreationEmbed, reaction, "spell");
                        break;
                    case "⬇️":
                        spellObject = _handleValueChange(spellObject, -1, spellCreationEmbed, reaction, "spell");
                        break;
                    case "⏬":
                        spellObject = _handleValueChange(spellObject, -5, spellCreationEmbed, reaction, "spell");
                        break;
                    case "➡️":
                        spellObject = _getNextSpellScreen(spellCreationEmbed, spellObject, reaction);
                        if (spellObject.creationComplete) {
                            spellCreationEmbed.delete();
                            db.newSpell(spellObject, () => {
                                msg.channel.send(`New spell \`${spellObject.name}\` has been created!`);
                            });
                            return;
                        }
                        break;
                    case "🗑️":
                        spellCreationEmbed.delete();
                        msg.channel.send("Spell creation cancelled.");
                        return;
                }
            });
        });
    });
}

/**
 * Delets the spell from the database.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} msg The discord message object.
 */
function deleteSpells(rawInput, msg) {
    let spellName = ui.getName(rawInput);
    db.deleteItem(spellName, msg);
}

/**
 * Creates a shop object allowing players to purchase item from it.
 * @param {array} rawInput The raw user input split into an array.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function shop(rawInput, gameName, msg) {
    let dashAmount = ui.dashAmount(rawInput);
    dashAmount--; // Accounts for the extra "-" for the shop name.

    if (dashAmount % 2 !== 0)
        return error.error("Incorrect command format.", "This is a complex command, don't forget the `-` before each entry.\nFor every item listed, it **MUST** also have a `$` value.\n`!shop -<shop name> -<item name> -<$> -<item name> -<$>...`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput).map(arg => arg.replace(/ /g, "_").toLowerCase());
    let stockString = "";
    let accountedStock = 0;
    let totalStock = (parsedCommand.length - 2) / 2;

    if ((parsedCommand.length - 2) > 18)
        return error.error("This command only accepts up to a max of 9 items per shop.", undefined, msg);

    db.getShop(parsedCommand[1], gameName, true, msg, shopInfo => {
        if (shopInfo)
            return error.error("Shop with that name already exists.", undefined, msg);

        for(let i = 3; i < parsedCommand.length; i += 2) {
            if (parsedCommand[i] && isNaN(parsedCommand[i]))
                return error.error("The `$` value of the item should be a number.", undefined, msg);

            let stockName = parsedCommand[i - 1];
            let stockPrice = parsedCommand[i];
            db.getItemInfo(stockName, false, msg, itemInfo => {
                if (itemInfo.item_name === "bare_fist" || itemInfo.item_name === "torn_clothing")
                    return error.error("Cannot sell `torn_clothing` and `bare_fist`.", "These are default items given to all players.", msg);

                stockString += `~${stockName}|${stockPrice}`;
                accountedStock++;
                if (accountedStock === totalStock) {
                    db.createShop(parsedCommand[1], stockString, gameName);
                    msg.channel.send(`Shop \`${parsedCommand[1]}\` has been created.`);
                }
            });
        }
    });
}

/**
 * Deletes a shop from the database.
 * @param {array} rawInput The raw user input split into an array.
 * @param {string} gameName The game name
 * @param {object} msg The discord message object.
 */
function deleteShop(rawInput, gameName, msg) {
    let shopName = ui.getName(rawInput);
    db.deleteShop(shopName, gameName, msg);
}

/**
 * Returns the key when given a value.
 * @param {object} object The object from which to get the key from.
 * @param {string} value The value of the key.
 */
function _getKeyFromValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

/**
 * Generates a shop UI allowing players to click reactions and purchase items.
 * @param {string} shopName The shop name.
 * @param {array} fields The fields showing the items for sale.
 * @param {object} gameObject The game object.
 * @param {object} stockInfo The shop stock.
 * @param {object} msg The discord message object.
 */
function _generateShopUI(shopName, fields, gameObject, stockInfo, msg) {
    let shopEmbed = new Discord.MessageEmbed()
        .setColor("0x34eba1")
        .setTitle(`${shopName} is open for business!`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/OcL9wKi.png")
        .addFields(fields)
        .setFooter("The host can close the shop by clicking 🗑️.\nThis menu will auto timeout in 10 minutes.")

    msg.client.channels.cache.get(gameObject.playerChannel).send(shopEmbed).then(async shopCreationEmbed => {
        let index = 0;
        let userInput;
        let key;
        fields.forEach(field => {
            shopCreationEmbed.react(emojiValue[index++]);
        });
        shopCreationEmbed.react("🗑️");

        const filter = (reaction, user) => {
            userInput = user.username;
            return ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🗑️"].includes(reaction.emoji.name) && !user.bot;
        }

        // Handle the reactions.
        const collector = shopCreationEmbed.createReactionCollector(filter, {time: 600000});
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "1️⃣":
                    key = _getKeyFromValue(emojiValue, "1️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "2️⃣":
                    key = _getKeyFromValue(emojiValue, "2️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "3️⃣":
                    key = _getKeyFromValue(emojiValue, "3️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "4️⃣":
                    key = _getKeyFromValue(emojiValue, "4️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "5️⃣":
                    key = _getKeyFromValue(emojiValue, "5️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "6️⃣":
                    key = _getKeyFromValue(emojiValue, "6️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "7️⃣":
                    key = _getKeyFromValue(emojiValue, "7️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "8️⃣":
                    key = _getKeyFromValue(emojiValue, "8️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "9️⃣":
                    key = _getKeyFromValue(emojiValue, "9️⃣");
                    db.buyItem(userInput, gameObject, stockInfo[key].name, stockInfo[key].price, msg);
                    break;
                case "🗑️":
                    if (ui.isHost(gameObject.host, userInput)) {
                        shopCreationEmbed.delete();
                        msg.client.channels.cache.get(gameObject.playerChannel).send("Shop closed. See you next time!");
                    }
                    return;
            }
            ui.removeReaction(reaction);
        });
    });
}

/**
 * Displays the shop to the players.
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function openShop(rawInput, gameObject, msg) {
    let shopName = ui.getName(rawInput);

    db.getShop(shopName, gameObject.game_title, false, msg, shopInfo => {
        let parsedStock = shopInfo.stock.split(/~/g);
        parsedStock.shift();

        let stockInfo = [];
        let fields = [];
        let index = 0;
        parsedStock.forEach(stock => {
            let nameAndPrice = stock.split("|");
            db.getItemInfo(nameAndPrice[0], false, msg, itemInfo => {
                stockInfo[index] = {name: itemInfo.item_name, price: nameAndPrice[1]};
                if (itemInfo.weapon) {
                    fields[index++] = {name: `${emojiValue[index - 1]}: 🗡️ ${itemInfo.item_name}`, value:`:coin: ${nameAndPrice[1]}`, inline: true};
                } else if (!itemInfo.weapon && itemInfo.equipable) {
                    fields[index++] = {name: `${emojiValue[index - 1]}: 🥼 ${itemInfo.item_name}`, value:`:coin: ${nameAndPrice[1]}`, inline: true};
                } else if (itemInfo.consumable) {
                    fields[index++] = {name: `${emojiValue[index - 1]}: 🍞 ${itemInfo.item_name}`, value:`:coin: ${nameAndPrice[1]}`, inline: true};
                } else {
                    fields[index++] = {name: `${emojiValue[index - 1]}: 🪨 ${itemInfo.item_name}`, value:`:coin: ${nameAndPrice[1]}`, inline: true};
                }

                // Once all item information is read, we can generate the UI.
                if (index === parsedStock.length) {
                    _generateShopUI(shopName, fields, gameObject, stockInfo, msg);
                    msg.react("✅");
                }
            });
        });
    });
}

/**
 * Creates a bot (usually an enemy).
 * @param {array} rawInput The raw user input split into an array.
 * @param {object} gameObject The game object.
 * @param {object} msg The discord message object.
 */
function bot(rawInput, gameObject, msg) {
    if (ui.dashAmount(rawInput) !== 7)
        return error.error("Improper number of inputs.", "`!make-bot -<bot name> -<health amount> -<strength amount> -<armor amount> -<weapon dice size> -<bonus healing power> -<bonus spell damage>`", msg);

    let parsedCommand = ui.parseDashedCommand(rawInput);
    parsedCommand[1] = parsedCommand[1].toLowerCase();
    if (!isNaN(parsedCommand[1]))
        return error.error("The name of the bot should not only consist of numbers.", "`!make-bot -<bot name> -<health amount> -<strength amount> -<armor amount> -<weapon dice size> -<bonus healing power> -<bonus spell damage>`", msg);

    // Validate if all the args are proper.
    let inputsPass = true;
    parsedCommand.slice(2,parsedCommand.length).forEach(arg => {
        if (isNaN(arg)) {
            error.error("Every input after the first should be a number!", "`!make-bot -<bot name> -<health amount> -<strength amount> -<armor amount> -<weapon dice size> -<bonus healing power> -<bonus spell damage>`", msg);
            inputsPass = false;
            return;
        }
    });
    if (!inputsPass)
        return;

    if (gameObject.players.includes(parsedCommand[1]) || parsedCommand[1].includes("|"))
        return error.error("Error with the bot name.", "Try changing the name so its unique and does not contain the `|` character.", msg);

    let playerObject = {};
    playerObject.game = gameObject.game_title;
    playerObject.username = parsedCommand[1];
    playerObject.image = null;
    playerObject.isBot = 1;
    playerObject.spells = [];
    playerObject.items = [`${parsedCommand[1]}_weapon`, `${parsedCommand[1]}_clothing`];
    playerObject.weapon = `${parsedCommand[1]}_weapon`;
    playerObject.clothing = `${parsedCommand[1]}_clothing`;
    playerObject.journal = [];
    playerObject.maxInventory = 50;
    playerObject.armor = parsedCommand[4];
    playerObject.bonusSpell = 0;
    playerObject.bonusHealing = 0;
    playerObject.luck = 0;
    playerObject.money = 0;
    playerObject.strength = parsedCommand[3];
    playerObject.health = parsedCommand[2];
    playerObject.maxHealth = parsedCommand[2];
    playerObject.mana = 1000;
    playerObject.maxMana = 1000;
    playerObject.class = "Bot";

    let weaponObj = {};
    weaponObj.name = `${parsedCommand[1]}_weapon`;
    weaponObj.equipable = 1;
    weaponObj.consumable = 0;
    weaponObj.description = `The main weapon for ${parsedCommand[1]}`;
    weaponObj.image = "https://imgur.com/3LkSZR8.png";
    weaponObj.damage_dice = parsedCommand[5];
    weaponObj.weapon = 1;
    weaponObj.bonusHealth = 0;
    weaponObj.bonusStrength = 0;
    weaponObj.bonusMana = 0;
    weaponObj.bonusArmor = 0;
    weaponObj.bonusSpell = 0;
    weaponObj.bonusHealing = 0;
    weaponObj.bonusLuck = 0;
    weaponObj.bonusInventory = 0;
    weaponObj.bonusMoney= 0;

    let clothingObj = {};
    clothingObj.name = `${parsedCommand[1]}_clothing`;
    clothingObj.equipable = 1;
    clothingObj.consumable = 0;
    clothingObj.description = `The main clothing for ${parsedCommand[1]}`;
    clothingObj.image = "https://imgur.com/nu9lnIq.png";
    clothingObj.damage_dice = 0;
    clothingObj.weapon = 0;
    clothingObj.bonusHealth = 0;
    clothingObj.bonusStrength = 0;
    clothingObj.bonusMana = 0;
    clothingObj.bonusArmor = 0;
    clothingObj.bonusSpell = 0;
    clothingObj.bonusHealing = 0;
    clothingObj.bonusLuck = 0;
    clothingObj.bonusInventory = 0;
    clothingObj.bonusMoney= 0;

    db.newItem(weaponObj);
    db.newItem(clothingObj);
    db.addPlayer(playerObject);
    gameObject.players.push(parsedCommand[1]);
    db.updateGamePlayerList(gameObject.game_title, gameObject.players);
    msg.react("✅");
}

/**
 * Deletes the bot from the database.
 * @param {array} rawInput The raw user input split into an array.
 * @param {players} playerList The player list.
 * @param {string} gameName The game name.
 * @param {object} msg The discord message object.
 */
function deleteBot(rawInput, playerList, gameName, msg) {
    let botName = ui.getName(rawInput);
    if (!playerList.includes(botName))
        return error.error("There is no bot with that name currently in the game.", "Bots are automatically delete upon death.", msg);

    const indexOfBot = playerList.indexOf(botName);
    playerList.splice(indexOfBot, 1);
    db.deletePlayer(botName, gameName, playerList);
    msg.react("✅");
}

exports.items = items;
exports.deleteItem = deleteItem;
exports.spells = spells;
exports.deleteSpells = deleteSpells;
exports.shop = shop;
exports.deleteShop = deleteShop;
exports.openShop = openShop;
exports.bot = bot;
exports.deleteBot = deleteBot;
