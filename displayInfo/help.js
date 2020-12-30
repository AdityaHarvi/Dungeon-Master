const ui = require("../util/UImethods"),
    Discord = require("discord.js");

/**
 * Combat information menu. Shows all the commands related to combat.
 */
function _getCombatMenu() {
    return new Discord.MessageEmbed()
        .setColor("0x42d7f5")
        .setTitle("⚔️ Combat Commands Menu ⚔️")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/G8zR8Gd.png")
        .setDescription("Clicking the reaction icons can take you to the respective page.\nClicking 🌐 will return you to the home screen.")
        .addFields(
            {name: "`!attack`", value: "Attack with your weapon.\nAuto rolls dice.", inline: true},
            {name: "`!bleed <#>`", value: "Gives you mana at the cost of 2* as much health.", inline: true},
            {name: "`!cast <spell> <target name: optional>`", value: "Cast a spell.\nAuto rolls dice.\nTarget name does not need to be supplied if casting a `Misc` spell.", inline: true},
            {name: "`!roll <optional: dice size>`", value: "Rolls a requested sized dice. Defaults to 20.", inline: true},
            {name: "`!use <item>`", value: "Your character will use a consumable item.", inline: true},
            {name: "`!coin`", value: "Cant decide on what to do? Flip a coin!", inline: true}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

/**
 * Inventory commands menu. Shows all the commands related to combat.
 */
function _getInventoryMenu() {
    return new Discord.MessageEmbed()
        .setColor("0x42f5b9")
        .setTitle("🎒 Inventory Commands Menu 🎒")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/SVAS8pY.png")
        .setDescription("Clicking the reaction icons can take you to the respective page.\nClicking 🌐 will return you to the home screen.")
        .addFields(
            {name: "`!equip <item>`", value: "Equips an item.", inline: true},
            {name: "`!drop -<item name> -<quantity: optional>`", value: "Drops an item from your inventory.", inline: true},
            {name: "`!give -<player name> -<item name> -<quantity: optional>`", value: "Give another player an item.", inline: true},
            {name: "`!upload <imgur URL>`", value: "Modify your character image as seen from the `!info` command.\nOnly accepts imgur links ending with .png / .gif extensions.", inline: true},
            {name: "`!journal`", value: "Read your private journal!", inline: true},
            {name: "`!add-note -<entry name> -<description>`", value: "Add something to your journal to help you remember!", inline: true},
            {name: "`!del-note <entry name>`", value: "Scratch out an entry form your journal.", inline: true},
            {name: "`!pay <player name> <$>`", value: "Pay another player a `$` amount of cash.", inline: true}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

/**
 * Information commands menu. Shows all the commands that give information about a game mechanic.
 */
function _getInfoMenu() {
    return new Discord.MessageEmbed()
        .setColor("0x54f542")
        .setTitle("📋 Information Commands Menu 📋")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/bYatIYu.png")
        .setDescription("Clicking the reaction icons can take you to the respective page.\nClicking 🌐 will return you to the home screen.")
        .addFields(
            {name: "`!info`", value: "Displays your inventory.", inline: true},
            {name: "`!item <item name>`", value: "Gets info about the item.", inline: true},
            {name: "`!spell <spell name>`", value: "Gets info about the spell.", inline: true},
            {name: "`!class`", value: "Displays a UI for class info.", inline: true}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

function _getGameStatusInfo() {
    return new Discord.MessageEmbed()
        .setColor("0x10A72E")
        .setTitle("Help Menu")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/L9Co78B.png")
        .setDescription("Clicking the reaction icons can take you to the respective page.\nClicking 🌐 will return you to the home screen.")
        .addFields(
            {name: "`!create -<campaign name> -<campaign description>`", value: "Generate a UI allowing players to join a game.", inline: true},
            {name: "`!pause-game <campaign name>`", value: "Pause the game preventing players from typing in it and allowing all other members of the server to view the text channel.", inline: true},
            {name: "`!play-game <campaign name>`", value: "Set the game as active- allowing players to type into the channels and preventing non-players from viewing the channel.", inline: true},
            {name: "`!end-game <campaign name>`", value: "Generate a UI allowing the host to either archive or fully wipe the game.", inline: true}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

/**
 * Displays the basic help menu.
 */
function _getBaseHelpMenu() {
    return new Discord.MessageEmbed()
        .setColor("0x10A72E")
        .setTitle("Help Menu")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/GKzfjCg.png")
        .setDescription("Clicking the reaction icons can take you to the respective page.\nClicking 🌐 will return you to the home screen.")
        .addFields(
            {name: "📋 Information", value: "\u200b", inline: true},
            {name: "🎒 Inventory", value: "\u200b", inline: true},
            {name: "⚔️ Combat", value: "\u200b", inline: true},
            {name: "🖥️ Game Status", value: "\u200b", inline:true},
            {name: "🕵️ Admin", value: "\u200b", inline: true}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

/**
 * Displays the admin commands.
 */
function _getAdminMenu() {
    return new Discord.MessageEmbed()
        .setColor("0xb04360")
        .setTitle("Admin Command Menu")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/GKzfjCg.png")
        .addFields(
            {name: "`!init`", value: "Rolls the dice for all players and sorts the info. Uses a D20."},
            {name: "`!give-money <player name> <$>`", value: "Generate money and give it to a player."},
            {name: "`!take-money <player name> <$>`", value: "Take money away from a player."},
            {name: "`!make-item -<item name> -<description> -<imgur link: optional>`", value: "Create an item.\nDon't forget the `-`'s."},
            {name: "`!del-item <item name>`", value: "Deletes an item. If the spell was given to players, it will be completely removed."},
            {name: "`!make-spell -<spell name> -<description> -<imgur link: optional>`", value: "Creates a spell.\nDon't forget the `-`'s."},
            {name: "`!del-spell <spell name>`", value: "Deletes a spell."},
            {name: "`!shop -<shop name> -<item name> -<$> -<item name> -<$>...`", value: "Creates a shop which can be unlocked (allowing players to purchase from it).\nAllows up to 9 items to be sold."},
            {name: "`!del-shop <shop name>`", value: "Deletes a shop."},
            {name: "`!unlock <shop name>`", value: "Lets players purchase from a shop."},
            {name: "`!make-bot -<bot name> -<health amount> -<strength amount> -<armor amount> -<weapon dice size> -<bonus healing power> -<bonus spell damage>`", value: "Create a bot/enemy allowing players to fight it."},
            {name: "`!del-bot <bot name>`", value: "Deletes a bot."},
            {name: "`!give-spell -<player name> -<spell name>`", value: "Give a player a spell."},
            {name: "`!take-spell -<player name> -<spell name>`", value: "Take a spell from a player."},
            {name: "`!give-item -<player name> -<item name> -<#: optional>`", value: "Give a certain # of items to a player."},
            {name: "`!take-item -<player name> -<item name> -<quantity: optional>`", value: "Take a certain # of items from a player."},
            {name: "`!purge <#>`", value: "Delete a certain # of messagse."},
            {name: "`!inc -<player name> -<health/mana/strength> -<#>`", value: "Increase the health or mana or strength of a player.\nDoes not go beyond the max of the player."},
            {name: "`!dec -<player name> -<health/mana/strength> -<#>`", value: "Decrease the health or mana or strength of a player.\nDoes not go below 0."},
            {name: "`!set-max -<player name> -<health/mana> -<#>`", value: "Adjust the maximum health or mana for a player."},
            {name: "`!view-info <player name>`", value: "View the inventory/info of any player."},
            {name: "`!a-attack -<player name to control> -<player name to attack>`", value: "Control a player and attack for them."},
            {name: "`!a-equip -<player name to control> -<item to equip>`", value: "Control a player and equip an item for them."},
            {name: "`!a-cast -<player name to control> -<spell name> -<target name: optional>`", value: "Control a player and cast a spell for them."}
        )
        .setFooter("All commands are lowercase.\nThis menu will timeout in 5 minutes.")
}

/**
 * Creates a help menu UI allowing players to view all the different commands.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function generateBaseHelpMenu(msg) {
    const baseMenu = _getBaseHelpMenu();
    const combatMenu = _getCombatMenu();
    const inventoryMenu = _getInventoryMenu();
    const adminMenu = _getAdminMenu();
    const infoMenu = _getInfoMenu();
    const gameStatusMenu = _getGameStatusInfo();

    // Send the message and setup emotes.
    msg.channel.send(baseMenu).then(async helpMenu => {
        await helpMenu.react("📋");
        await helpMenu.react("🎒");
        await helpMenu.react("⚔️");
        await helpMenu.react("🖥️");
        await helpMenu.react("🕵️");
        await helpMenu.react("🌐");

        const filter = (reaction, user) => {
            return ["📋","🎒","⚔️","🖥️","🌐","🕵️"].includes(reaction.emoji.name) && !user.bot;
        }

        // Handle the reactions.
        const collector = helpMenu.createReactionCollector(filter, {time: 300000});
        collector.on("collect", reaction => {
            switch (reaction.emoji.name) {
                case "📋":
                    helpMenu.edit(infoMenu);
                    break;
                case "🎒":
                    helpMenu.edit(inventoryMenu);
                    break;
                case "⚔️":
                    helpMenu.edit(combatMenu);
                    break;
                case "🖥️":
                    helpMenu.edit(gameStatusMenu);
                    break;
                case "🕵️":
                    helpMenu.edit(adminMenu);
                    break;
                case "🌐":
                    helpMenu.edit(baseMenu);
                    break;
            }
            ui.removeReaction(reaction);
        });
    });
}

exports.baseMenu = generateBaseHelpMenu;
