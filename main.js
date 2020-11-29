const Discord = require("discord.js"),
    client = new Discord.Client(),
    token = 'NzI5MDczNzQ2NzEwODg4NDcz.XwDpcw.y1NhtNh9LZy4zRfdIp6kiCUCElM',
    PREFIX = "!",
    handleInput = require("./handleInput");

// Log into the bot.
client.login(token);

// Startup
client.on('ready', () => {
    console.log('System is online.');
    client.user.setActivity('!help');
});

client.on('message', msg => {
    // Error handling to ensure bot does not respond to itself and to only reply when commands are said in specific channels.
    if (msg.author.bot || !msg.content.startsWith(PREFIX) || !msg.member) return;

    let args = msg.content.substring(PREFIX.length).split(" ");

    // switch(args[0]) {
    //     // Information commands (to learn more about something).
    //     case 'info':
    //         getInfo.getPlayerInfo(msg.member.nickname.toLowerCase(), msg, (playerInfo) => {
    //             displayInfo.displayPlayerInfo(playerInfo.name, msg);
    //         });
    //         break;
    //     case 'class':
    //         help.classHelpMenu(args[1], msg);
    //         break;
    //     case 'help':
    //         if (args[1]) {
    //             switch(args[1]) {
    //                 case 'info':
    //                     help.infoCommandHelpMenu(msg);
    //                     return;
    //                 case 'inventory':
    //                     help.inventoryHelpMenu(msg);
    //                     return;
    //                 case 'combat':
    //                     help.combatHelpMenu(msg);
    //                     return;
    //             }
    //         }
    //         help.helpMenu(msg);
    //         break;
    //     case 'spell':
    //         (args[1]) ?
    //             displayInfo.displaySpellInfo(args[1].toLowerCase(), msg) : 
    //             error.error('Invalid input. `!spell <spell name>` is the full command.', msg);
    //         break;
    //     case 'item':
    //         (args[1]) ? 
    //             displayInfo.displayItemInfo(args[1].toLowerCase(), msg) : 
    //             error.error('Invalid input. `!item <item name>` is the full command.', msg);
    //         break;
    //     case 'ability':
    //         (args[1]) ? 
    //             displayInfo.displayAbilityInfo(args[1].toLowerCase(), msg) : 
    //             error.error('Invalid input. `!ability <ability name>` is the full command.', msg);
    //         break;
        
    //     // Game join and player inventory commands.
    //     case 'join':
    //         (args[1]) ? 
    //             startup.generateDefaultCharacter(args[1].toLowerCase(), msg) :
    //             error.error('You need to pick a class. `!join <juggernaut/assassin/wizard/paladin/cleric/archmage/bard/>`. To learn more about each class, do `!class <name>`', msg);
    //         break;
    //     case 'upload-image':
    //         (args[1]) ?
    //             upload.uploadImage(args[1], msg.member.nickname, msg) :
    //             error.error('You need to enter a direct link URL that you want to upload.', msg);
    //         break;
    //     case 'drop':
    //         (args[1]) ?
    //             drop.dropItem(args[1].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!drop <item>` is the full command.', msg);
    //         break;
    //     case 'equip':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         (args[1]) ?
    //             equip.equipItem(msg.member.nickname, args[1].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!equip <item>` is the full command. Only works if the item can be equiped.', msg);
    //         break;
    //     case 'unequip':
    //         equip.equipItem(msg.member.nickname, 'bare_fist', msg);
    //         break;
    //     case 'give':
    //         (args[1] && args[2]) ?
    //             transfer.transferItem(args[1].toLowerCase(), args[2].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!give <player> <item>` is the proper command.', msg);
    //         break;
    //     case 'add-note':
    //         if (args.length >= 3) {
    //             let message = '';
    //             for (let i = 2; i < args.length; i++) {
    //                 message += args[i] + ' ';
    //             }

    //             journal.addNote(msg.member.nickname, args[1].toLowerCase(), message, msg);
    //         } else {
    //             error.error('If you want to make a journal entry, you need to have a name for the entry and the actual message itself too. `!add-note <entry name> <message>`', msg);
    //         }
    //         break;
    //     case 'journal':
    //         displayInfo.displayNote(msg.member.nickname, msg);
    //         break;
    //     case 'remove-note':
    //         (args[1]) ?
    //             journal.removeNote(msg.member.nickname, args[1].toLowerCase(), msg) :
    //             error.error('What is the name of the note that you want to scratch out? `!remove-note <note name>`.', msg);
    //         break;
        
    //     // Player combat commands.
    //     case 'roll':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         if (args[1] && (isNaN(args[1]) || args[1] < 1))  return error.error('Enter a whole number bigger than 1.', msg);

    //         getInfo.getPlayerInfo(msg.member.nickname, msg, (playerInfo) => {
    //             let extraInfo = {};
    //             extraInfo.diceSize = (args[1]) ? args[1] : 20;
    //             extraInfo.roll = Number(diceRoll.diceRoll(extraInfo.diceSize, msg));
    //             extraInfo.finalRoll = extraInfo.roll;
    //             extraInfo.specialAbility = false;

    //             if (playerInfo.abilities.includes('i_am_my_own_plus_1')) {
    //                 extraInfo.specialAbility = 'i_am_my_own_plus_1';
    //                 extraInfo.finalRoll += 1;
    //             }

    //             displayInfo.displayDiceRoll(playerInfo.name, extraInfo.finalRoll, extraInfo.roll, extraInfo.diceSize, extraInfo.specialAbility, msg);
    //         });
    //         break;
    //     case 'attack':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         (args[1]) ? 
    //             attack.attack(msg.member.nickname, args[1].toLowerCase(), msg) :
    //             attack.attack(msg.member.nickname, null, msg);
    //         break;
    //     case 'cast':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         if (args[2] && args[2] === 'meditate') {
    //             cast.cast(args[1].toLowerCase(), msg, false, false, client, 'meditate');
    //         } else if (args[3] && args[3] === 'prayer') {
    //             cast.cast(args[1].toLowerCase(), msg, args[2].toLowerCase(), false, client, 'prayer');
    //         } else if (args[2]) {
    //             cast.cast(args[1].toLowerCase(), msg, args[2].toLowerCase(), false, client, false);
    //         } else if (args[1]) {
    //             cast.cast(args[1].toLowerCase(), msg, false, false, client, false);
    //         } else {
    //             error.error('Incorrect input. `!cast <spell> <optional: player name> <optional: ability name>` is the proper format.', msg);
    //         }
    //         break;
    //     case 'use':
    //         (args[1]) ?
    //             useItem.useItem(args[1].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!use <item>` is the full command. Only works on consumables!', msg);
    //         break;
    //     case 'activate':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         (args[1]) ?
    //             activate.activatePower(msg.member.nickname, args[1].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!activate <ability>` is the full command.', msg);
    //         break;
    //     case 'coinflip':
    //         if (msg.channel.id !== '728382833688838187') return error.error('You can only run this command in the `dungeons-and-dragons` channel.', msg);
    //         let coin = ['Heads', 'Tails'],
    //             decision = diceRoll.diceRoll(2, msg);
    //         msg.reply(` got \`${coin[decision-1]}\``);
    //         break;
    //     case 'bleed':
    //         if (args[1]) {
    //             bleed.bleed(args[1], msg);
    //         } else {
    //             error.error('Incorrect input. `!bleed <#>` is the proper command.', msg);
    //         }
    //         break;

    //     // Admin commands.
    //     case 'admin':
    //         if (msg.channel.id !== '728412435131924482') return error.error('You can only run this command in the `bot-control` channel.', msg);
    //         adminHelp.adminHelp(msg);
    //         break;
    //     case 'add':
    //         if (msg.channel.id !== '728412435131924482')  {
    //             msg.delete();
    //             return error.error('You can only run this command in the `bot-control` channel. I deleted your message so others would not see.', msg);
    //         }

    //         (args[1] && args[2] && args[3]) ?
    //             adminModifyInventory.addObject(args[1].toLowerCase(), args[2].toLowerCase(), args[3].toLowerCase(), msg, client, args[4]) :
    //             error.error('Incorrect input. `!add <player> <spell/item/ability> <item name>` is the full command.', msg);
    //         break;
    //     case 'remove':
    //         if (msg.channel.id !== '728412435131924482')  {
    //             msg.delete();
    //             return error.error('You can only run this command in the `bot-control` channel. I deleted your message so others would not see.', msg);
    //         }

    //         (args[1] && args[2] && args[3]) ?
    //             adminModifyInventory.removeObject(args[1].toLowerCase(), args[2].toLowerCase(), args[3].toLowerCase(), msg, client) :
    //             error.error('Incorrect input. `!remove <player> <spell/item/ability> <item name>` is the full command.', msg);
    //         break;
    //     case 'damage':
    //         if (args[1] && args[2] && args[3]) {
    //             if (args[1] === 'mp') {
    //                 adminModifyStats.modifyMana(args[2].toLowerCase(), args[3].toLowerCase(), false, msg, client);
    //             } else if (args[1] === 'hp') {
    //                 adminModifyStats.modifyHealth(args[2].toLowerCase(), args[3].toLowerCase(), false, msg, client);
    //             }
    //         } else {
    //             error.error('Incorrect input. `!damage <mp/hp> <player> <#>` is the proper command.', msg);
    //         }
    //         break;
    //     case 'heal':
    //         if (args[1] && args[2] && args[3]) {
    //             if (args[1] === 'mp') {
    //                 adminModifyStats.modifyMana(args[2].toLowerCase(), args[3].toLowerCase(), true, msg, client);
    //             } else if (args[1] === 'hp') {
    //                 adminModifyStats.modifyHealth(args[2].toLowerCase(), args[3].toLowerCase(), true, msg, client);
    //             }
    //         } else {
    //             error.error('Incorrect input. `!heal <mp/hp> <player> <#>` is the full command.', msg);
    //         }
    //         break;
    //     case 'max':
    //         (args[1] && args[2] && args[3]) ?
    //             adminModifyStats.modifyMaxStats(args[1].toLowerCase(), args[2].toLowerCase(), args[3].toLowerCase(), msg, client) :
    //             error.error('Incorrect input. `!max <hp/str/mp> <player> <#>` is the full command.', msg);
    //         break;
    //     case 'view':
    //         (args[1]) ?
    //             displayInfo.displayPlayerInfo(args[1].toLowerCase(), msg) :
    //             error.error('Missing input. `!view <player>` is the full command.', msg);
    //         break;
    //     case 'init':
    //         (args[1]) ?
    //             adminRoll.rollForPlayers(args[1], msg) :
    //             adminRoll.rollForPlayers(null, msg);
    //         break;
    //     case 'init-enemy':
    //         if (args[1] && args[2]) {
    //             adminRoll.rollForEnmies(args[1], args[2], msg, true);
    //         } else if (args[1]) {
    //             adminRoll.rollForEnmies(args[1], null, msg, true);
    //         } else {
    //             error.error('Incorrect input. `!init-enemy <# of enemies> <optional: Dice Size>` is the full command.', msg);
    //         }
    //         break;
    //     case 'init-all':
    //         if (args[1] && args[2]) {
    //             adminRoll.rollForPlayers(args[2], msg, args[1]);
    //         } else if (args[1]) {
    //             adminRoll.rollForPlayers(20, msg, args[1]);
    //         } else {
    //             error.error('Incorrect input. `!init-all <# of enemies> <optional: diceSize>` is the full command.', msg);
    //         }
    //         break;
    //     case 'admin-equip':
    //         (args[1] && args[2]) ?
    //             equip.equipItem(args[1].toLowerCase(), args[2].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!admin-equip <player> <item>` is the full command. Admin only command.', msg);
    //         break;
    //     case 'admin-cast':
    //         if (args[1] && args[2] && args[3]) {
    //             cast.cast(args[2].toLowerCase(), msg, args[3].toLowerCase(), args[1].toLowerCase());
    //         } else if (args[1] && args[2]) {
    //             cast.cast(args[2].toLowerCase(), msg, null, args[1].toLowerCase());
    //         } else {
    //             error.error('Incorrect input. `!cast <ally> <spell> <playerName (if healing)>` is the proper format.', msg);
    //         }
    //         break;
    //     case 'admin-activate':
    //         (args[1] && args[2]) ?
    //             activate.activatePower(args[1].toLowerCase(), args[2].toLowerCase(), msg) :
    //             error.error('Incorrect input. `!admin-activate <name> <ability>` is the full command.', msg);
    //         break;
    //     case 'ally':
    //         (args[1] && args[2] && args[3] && args[4]) ?
    //             ally.allyCreation(args[1].toLowerCase(), args[2], args[3], args[4], msg) :
    //             error.error('Missing input. `!ally <name> <hp #> <str #> <mp #>` is the full command.', msg);
    //         break;
    //     case 'kill':
    //         (args[1]) ?
    //             ally.killAlly(args[1].toLowerCase(), msg) :
    //             error.error('Missing input. `!kill <ally>` is the full command.', msg);
    //         break;
    //     case 'add-inv':
    //         (args[1] && args[2]) ?
    //             adminModifyStats.modifyMaxInventory(args[1], args[2].toLowerCase(), true, msg) :
    //             error.error('Missing input. `!add-inv <#> <name>` is the full command.', msg);
    //         break;
    //     case 'remove-inv':
    //         (args[1] && args[2]) ?
    //             adminModifyStats.modifyMaxInventory(args[1], args[2].toLowerCase(), false, msg) :
    //             error.error('Missing input. `!remove-inv <#> <name>` is the full command.', msg);
    //         break;
    //     case 'purge':
    //         (args[1]) ?
    //             purge.purge(args[1], msg) :
    //             error.error('Missing input. `!purge <#>` is the full command.', msg);
    //         break;
    //     case 'admin-attack':
    //         if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);
    //         (args[1]) ? 
    //             attack.attack(args[1].toLowerCase(), null, msg) :
    //             error.error('You need to enter the name of the player for who you are attacking for.', msg);
    //         break;

    //     default:
    //         error.error('This is a unknown command.', msg);
    // }
})
