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
            {name: "`!attack`", value: "Attack with your weapon. Auto rolls dice.", inline: true},
            {name: "`!cast <spell> <player (if healing)>`", value: "Cast a spell. Auto rolls dice.", inline: true},
            {name: "`!bleed <#>`", value: "Gives you mana at the cost of 3* as much health.", inline: true},
            {name: "`!roll <optional: dice size>`", value: "Rolls a requested sized dice. Defaults to 20.", inline: true},
            {name: "`!coinflip`", value: "Cant decide on what to do? Flip a coin!", inline: true}
        )
        .setFooter("All commands are lowercase.")
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
            {name: "`!unequip`", value: "Unequips an item.", inline: true},
            {name: "`!use <item>`", value: "Your character will use a consumable item.", inline: true},
            {name: "`!give <player> <item>`", value: "Give another player an item.", inline: true},
            {name: "`!drop <item>`", value: "Drops an item from your inventory.", inline: true},
            {name: "`!journal`", value: "Read your private journal!", inline: true},
            {name: "`!add-note <entry name> <message>`", value: "Add something to your journal to help you remember!", inline: true},
            {name: "`!remove-note <entry name>`", value: "Scratch out an entry form your journal.", inline: true}
        )
        .setFooter("All commands are lowercase.")
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
            {name: "`!item <item>`", value: "Gets info about the item.", inline: true},
            {name: "`!spell <spell>`", value: "Gets info about the spell.", inline: true},
            {name: "`!class`", value: "Displays a UI for class info.", inline: true}
        )
        .setFooter("All commands are lowercase.")
}

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
            {name: "🕵️ Admin", value: "\u200b"}
        )
        .setFooter("All commands are lowercase.")
}

function _getAdminMenu() {
    return new Discord.MessageEmbed()
        .setColor("0xb04360")
        .setTitle("Admin Command Menu")
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setThumbnail("https://imgur.com/GKzfjCg.png")
        .addFields(
            {name: '`!add <player> <class> <item> <#>`', value: 'Gives a player an item. The last entry is optional.'},
            {name: '`!remove <player> <class> <item>`', value: 'Removes the item from the player info.'},
            {name: '`!damage <mp/hp> <player> <#>`', value: 'Removes "#" from player hp/mp'},
            {name: '`!heal <mp/hp> <player> <#>`', value: 'Adds "#" to player hp/mp'},
            {name: '`!init <optional: #>`', value: 'Rolls the dice for all players. Uses a D20 as default.'},
            {name: '`!init-enemy <# of enemies> <optional: Dice Size>`', value: 'Rolls the dice for all enemies using a D20 as a default, or you can set it.'},
            {name: '`!init-all <# of enemies> <optional: Dice Size>`', value: 'Rolls the dice for all player + enemies using a D20 as a default, or you can set it.'},
            {name: '`!view <player>`', value: 'View the character info for a player.'},
            {name: '`!max <hp/str/mp> <player> <#>`', value: 'Sets the players total stat to the requested amount.'},
            {name: '`!ally <name> <hp #> <str #> <mp #>`', value: 'Creates an ally.'},
            {name: '`!kill <ally>`', value: 'Kills an ally.'},
            {name: '`!admin-equip <name> <item>`', value: 'Force equips an item for a player.'},
            {name: '`!admin-cast <ally> <spell> <target (if healing spell)>`', value: 'Casts a spell for a player.'},
            {name: '`!admin-activate <name> <ability>`', value: 'Activates an ability for the specified player.'},
            {name: '`!add-inv <#> <name>`', value: 'Increase the players max-inventory.'},
            {name: '`!remove-inv <#> <name>`', value: 'Reduce the players max-inventory.'},
            {name: '`!purge <#>`', value: 'Delete a certain # of messages in the chat.'}
        )
        .setFooter("All commands are lowercase.")
}

function generateBaseHelpMenu(msg) {
    const baseMenu = _getBaseHelpMenu();
    const combatMenu = _getCombatMenu();
    const inventoryMenu = _getInventoryMenu();
    const adminMenu = _getAdminMenu();
    const infoMenu = _getInfoMenu();
    let inputUserName;

    // Send the message and setup emotes.
    msg.channel.send(baseMenu).then(async helpMenu => {
        await helpMenu.react("📋");
        await helpMenu.react("🎒");
        await helpMenu.react("⚔️");
        await helpMenu.react("🕵️");
        await helpMenu.react("🌐");

        const filter = (reaction, user) => {
            inputUserName = user.username;
            return ["📋","🎒","⚔️","🌐","🕵️"].includes(reaction.emoji.name) && !user.bot;
        }

        // Handle the reactions.
        const collector = helpMenu.createReactionCollector(filter);
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
