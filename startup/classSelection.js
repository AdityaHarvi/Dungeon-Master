const Discord = require("discord.js"),
    db = require("../databaseHandler/dbHandler"),
    ui = require("../util/UImethods");

/**
 * Assigns the proper health/mana/strength point depending on the class selected.
 * @param {string} className The selected class of the player.
 * @param {object} playerObject Player information object.
 */
function _classSelection(className, playerObject) {
    switch (className) {
        case "juggernaut":
            playerObject.class = "Juggernaut";
            playerObject.image = "https://i.imgur.com/ChxDqEE.png"
            playerObject.health = 40;
            playerObject.mana = 0;
            playerObject.armor = 13;
            break;
        case "assassin":
            playerObject.class = "Assassin";
            playerObject.image = "https://i.imgur.com/6UANXPh.png";
            playerObject.health = 18;
            playerObject.strength = 10;
            playerObject.mana = 0;
            break;
        case "wizard":
            playerObject.class = "Wizard";
            playerObject.image = "https://i.imgur.com/d5VfPOS.png";
            playerObject.health = 15;
            playerObject.mana = 20;
            playerObject.bonusSpell = 3;
            break;
        case "paladin":
            playerObject.class = "Paladin";
            playerObject.image = "https://i.imgur.com/BLhcLTS.png";
            playerObject.health = 25;
            playerObject.strength = 8;
            playerObject.mana = 5;
            playerObject.bonusHealing = 1;
            break;
        case "cleric":
            playerObject.class = "Cleric";
            playerObject.image = "https://i.imgur.com/AJZas5t.png";
            playerObject.health = 17;
            playerObject.mana = 10;
            playerObject.bonusHealing = 3;
            break;
        case "archmage":
            playerObject.class = "Archmage";
            playerObject.image = "https://i.imgur.com/10DmLXk.png";
            playerObject.health = 20;
            playerObject.strength = 7;
            playerObject.mana = 10;
            playerObject.bonusSpell = 1;
            break;
        case "bard":
            playerObject.class = "Bard";
            playerObject.image = "https://i.imgur.com/znRYmxK.png";
            playerObject.health = 23;
            playerObject.mana = 4;
            playerObject.luck = 3;
            break;
    }

    playerObject.maxHealth = playerObject.health;
    playerObject.maxMana = playerObject.mana;

    return playerObject;
}

/**
 * Generates an embed which gives more information per class.
 * @param {string} playerName The name of the player.
 */
function _getMoreInfoClassSelectionEmbed(playerName) {
    return new Discord.MessageEmbed()
        .setColor("0xcef542")
        .setTitle(`${playerName}'s Class Selection:`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Click ℹ️ to toggle for more info.")
        .addFields(
            {name: "🛡️ Juggernaut", value: "❤️40 | 💪5 | 🧪0", inline: true},
            {name: "⚔️ Assassin", value: "❤️18 | 💪10 | 🧪0", inline: true},
            {name: "🪄 Wizard", value: "❤️15 | 💪5 | 🧪20", inline: true},
            {name: "☀️ Paladin", value: "❤️25 | 💪8 | 🧪5", inline: true},
            {name: "⚕️ Cleric", value: "❤️17 | 💪5 | 🧪10", inline: true},
            {name: "🧙 Archmage", value: "❤️20 | 💪7 | 🧪10", inline: true},
            {name: "🎸 Bard", value: "❤️23 | 💪5 | 🧪4", inline: true}
        )
        .setFooter("'!class' if you want to read more!")
}

/**
 * Generates the base class selection screen.
 * @param {string} playerName The player name.
 */
function _getClassSelectionEmbed(playerName) {
    return new Discord.MessageEmbed()
        .setColor("0xcef542")
        .setTitle(`${playerName}'s Class Selection:`)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Click ℹ️ to toggle for more info.")
        .addFields(
            {name: "🛡️ Juggernaut", value: "+3 Armor", inline: true},
            {name: "⚔️ Assassin", value: "+5 Strength", inline: true},
            {name: "🪄 Wizard", value: "+3 Spell Damage", inline: true},
            {name: "☀️ Paladin", value: "+3 Strength\n+1 Healing", inline: true},
            {name: "⚕️ Cleric", value: "+3 Healing", inline: true},
            {name: "🧙 Archmage", value: "+2 Strength\n+1 Spell Damage", inline: true},
            {name: "🎸 Bard", value: "+3 Luck", inline: true}
        )
        .setFooter("'!class' if you want to read more!")
}

/**
 * Test to see if the person clicking the reactions can modify the UI.
 * @param {string} host The game host.
 * @param {string} playerName The player who owns this UI.
 * @param {string} user The user clicking the buttons.
 */
function _canModify(host, playerName, user) {
    return playerName === user || host === user;
}

/**
 * Sends a message to the chat confirming that the user has selected a class.
 * @param {string} pChannel The player channel.
 * @param {object} playerObject The player object.
 * @param {object} classEmbed The class embed.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _sendConfirmation(pChannel, playerObject, classEmbed, msg) {
    classEmbed.delete();
    db.addPlayer(playerObject);
    msg.guild.channels.cache.get(pChannel).send(`\`${playerObject.username}\` has chosen the \`${playerObject.class}\` class. Do \`!info\` to check out your inventory.`);
}

/**
 * Creates the base character stats.
 * @param {object} gameObject The game object.
 * @param {stirng} playerClass The class that the player has chosen.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function generateClassSelectionUI(gameObject, playerName, msg) {
    const selectionEmbed = _getClassSelectionEmbed(playerName);
    const moreInfoEmbed = _getMoreInfoClassSelectionEmbed(playerName);
    let inputUserName;
    let infoFlag = false;

    let playerObject = {};
    playerObject.game = gameObject.game_title;
    playerObject.username = playerName;
    playerObject.image = "";
    playerObject.isBot = 0;
    playerObject.spells = [];
    playerObject.items = ["bare_fist", "torn_clothing"];
    playerObject.weapon = "bare_fist";
    playerObject.clothing = "torn_clothing";
    playerObject.journal = [];
    playerObject.maxInventory = 15;
    playerObject.armor = 10;
    playerObject.bonusSpell = 0;
    playerObject.bonusHealing = 0;
    playerObject.luck = 0;
    playerObject.money = 0;
    playerObject.strength = 5;

    // Send the message and setup emotes.
    msg.guild.channels.cache.get(gameObject.playerChannel).send(selectionEmbed).then(async classEmbed => {
        await classEmbed.react("🛡️");
        await classEmbed.react("⚔️");
        await classEmbed.react("🪄");
        await classEmbed.react("☀️");
        await classEmbed.react("⚕️");
        await classEmbed.react("🧙");
        await classEmbed.react("🎸");
        await classEmbed.react("ℹ️");

        const filter = (reaction, user) => {
            inputUserName = user.username;
            return ["🛡️","⚔️","🪄","☀️","⚕️","🧙","🎸","ℹ️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = classEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            // Only accept input from the host or the user who is selecting their class.
            if (_canModify(gameObject.host, playerName, inputUserName)) {
                switch (reaction.emoji.name) {
                    case "ℹ️":
                        if (infoFlag) {
                            infoFlag = false;
                            classEmbed.edit(selectionEmbed);
                        } else {
                            infoFlag = true;
                            classEmbed.edit(moreInfoEmbed);
                        }
                        break;
                    case "🛡️":
                        playerObject = _classSelection("juggernaut", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "⚔️":
                        playerObject = _classSelection("assassin", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "🪄":
                        playerObject = _classSelection("wizard", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "☀️":
                        playerObject = _classSelection("paladin", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "⚕️":
                        playerObject = _classSelection("cleric", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "🧙":
                        playerObject = _classSelection("archmage", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                    case "🎸":
                        playerObject = _classSelection("bard", playerObject);
                        _sendConfirmation(gameObject.playerChannel, playerObject, classEmbed, msg);
                        return;
                }
            }
            ui.removeReaction(reaction);
        });
    });
}

exports.generateClassSelectionUI = generateClassSelectionUI;
