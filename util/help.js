/**
 * Populates the fields for the combat information embed.
 */
function getCombatFields() {
    let fields = [];

    fields[0] = {name: '`!attack`', value: 'Auto calculates your damage. If you have the necessary abilities, you can do `!attack <risky/super/ultra/double>` to do special attacks.', inline: true};
    fields[1] = {name: '`!cast <spell> <player (if healing)>`', value: 'Cast a spell. Auto rolls dice.', inline: true};
    fields[2] = {name: '`!bleed <#>`', value: 'Gives you mana at the cost of 3* as much health.', inline: true};
    fields[3] = {name: '`!roll <optional: dice size>`', value: 'Rolls a requested sized dice. Defaults to 20.', inline: true};
    fields[4] = {name: '`!activate <ability>`', value: 'Activates an ability.', inline: true};
    fields[5] = {name: '`!coinflip`', value: 'Flip a coin!', inline: true};

    return fields;
}

/**
 * Combat information menu. Shows all the commands related to combat.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function combatHelpMenu(msg) {
    const combatHelpEmbed = {
        color: 0x42d7f5,
        title: '⚔️ Combat Commands Menu ⚔️',
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/MivKiKL.png',
        },
        fields: getCombatFields(),
        footer: {
            text: 'All commands are lowercase.'
        }
    };

    return msg.channel.send({embed: combatHelpEmbed});
}

/**
 * Populates the fields for the inventory information embed.
 */
function getInventoryCommandFields() {
    let fields = [];

    fields[0] = {name: '`!equip <item>`', value: 'Equips an item.', inline: true};
    fields[1] = {name: '`!unequip`', value: 'Unequips an item.', inline: true};
    fields[2] = {name: '`!use <item>`', value: 'Your character will use a consumable item.', inline: true};
    fields[3] = {name: '`!give <player> <item>`', value: 'Give another player an item.', inline: true};
    fields[4] = {name: '`!drop <item>`', value: 'Drops an item from your inventory.', inline: true};
    fields[5] = {name: '`!journal`', value: 'Read your private journal!', inline: true};
    fields[6] = {name: '`!add-note <entry name> <message>`', value: 'Add something to your journal to help you remember!', inline: true};
    fields[7] = {name: '`!remove-note <entry name>`', value: 'Scratch out an entry form your journal.', inline: true};

    return fields;
}

/**
 * Inventory commands menu. Shows all the commands related to combat.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function inventoryHelpMenu(msg) {
    const inventoryHelpEmbed = {
        color: 0x42f5b9,
        title: '🎒 Inventory Commands Menu 🎒',
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/MivKiKL.png',
        },
        fields: getInventoryCommandFields(),
        footer: {
            text: 'All commands are lowercase.'
        }
    };

    return msg.channel.send({embed: inventoryHelpEmbed});
}

/**
 * Populates the fields for the information commansd embed.
 */
function getInfoCommandFields() {
    let fields = [];

    fields[0] = {name: '`!help`', value: 'Help page', inline: true};
    fields[1] = {name: '`!join`', value: 'Setup a character to join the game.', inline: true};
    fields[2] = {name: '`!info`', value: 'Character information for page.', inline: true};
    fields[3] = {name: '`!item <item>`', value: 'Gets info about the item.', inline: true};
    fields[4] = {name: '`!spell <spell>`', value: 'Gets info about the spell.', inline: true};
    fields[5] = {name: '`!ability <ability>`', value: 'Gets info about the ability.', inline: true};
    fields[6] = {name: '`!class <class name>`', value: 'Gets info about the class.', inline: true};

    return fields;
}

/**
 * Information commands menu. Shows all the commands that give information about a game mechanic.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function infoCommandHelpMenu(msg) {
    const infoCommandsHelpEmbed = {
        color: 0x54f542,
        title: '📋 Information Commands Menu 📋',
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/MivKiKL.png',
        },
        fields: getInfoCommandFields(),
        footer: {
            text: 'All commands are lowercase.'
        }
    };

    return msg.channel.send({embed: infoCommandsHelpEmbed});
}

/**
 * Populates the fields for the base help page.
 */
function getHelpFields() {
    let fields = [];

    fields[0] = {name: '📋 **Information Commands**', value: '`!help info`'};
    fields[1] = {name: '🎒 **Inventory Commands**', value: '`!help inventory`'};
    fields[2] = {name: '⚔️ **Combat Commands**', value: '`!help combat`'};

    return fields;
}

/**
 * Displays the sub-menus.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function helpMenu(msg) {
    const helpEmbed = {
        color: 0x10A72E,
        title: 'Help Menu',
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/MivKiKL.png',
        },
        fields: getHelpFields(),
        footer: {
            text: 'All commands are lowercase.'
        }
    };

    return msg.channel.send({embed: helpEmbed});
}

/**
 * Populates the fields for the embed.
 * @param {string} className The name of the class.
 */
function getClassFields(className) {
    let fields = [],
        classObject = {};

    switch(className) {
        case 'juggernaut':
            classObject.url = 'https://i.imgur.com/ChxDqEE.png';
            fields[0] = {name: '|-------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 40 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|-----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA--------|', value: `|‾‾‾‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'This character can endure massive damage. Shrug off even the largest of hits.'};
            break;
        case 'paladin':
            classObject.url = 'https://i.imgur.com/BLhcLTS.gif';
            fields[0] = {name: '|-------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 30 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|-----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾( 6 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA--------|', value: `|‾‾‾‾‾‾‾‾‾‾( 2 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'Take hits and deal damage, you can use your shield as good as your sword.'};
            break;
        case 'assassin':
            classObject.url = 'https://i.imgur.com/6UANXPh.png';
            fields[0] = {name: '|------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 18 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|-----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾( 6 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'Use the shadows to your advantage. You know the enemies weakpoints and can perform critical hits with ease. Careful not to fight directly through, you cannot sustain a fight for long.'};
            break;
        case 'wizard':
            classObject.url = 'https://i.imgur.com/d5VfPOS.png';
            fields[0] = {name: '|------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾( 15 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾( 0 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|-------MANA--------|', value: `|‾‾‾‾‾‾‾‾( 14 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'As a master of the dark arts, you control the elements. Destroy your enemies with overwhelming power. Fight from the rear ranks and use your range to your advantage, a wizard cannot survive for long while they are alone.'};
            break;
        case 'cleric':
            classObject.url = 'https://i.imgur.com/AJZas5t.png';
            fields[0] = {name: '|-------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 28 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|-----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾‾( 1 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA--------|', value: `|‾‾‾‾‾‾‾‾‾‾( 6 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'Use the power of the divine to heal your allies and to vanquish your foes. With you on their team, your friends can never die.'};
            break;
        case 'archmage':
            classObject.url = 'https://i.imgur.com/10DmLXk.png';
            fields[0] = {name: '|-------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 20 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|-----STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾( 3 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA--------|', value: `|‾‾‾‾‾‾‾‾‾‾( 8 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'You know the sword as well as the flames. Combat your foes with ranged and melee weapons.'};
            break;
        case 'bard':
            classObject.url = 'https://i.imgur.com/znRYmxK.png';
            fields[0] = {name: '|-------HEALTH-------|', value: `|‾‾‾‾‾‾‾‾‾‾( 25 )‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[1] = {name: '|------STRENGTH-----|', value: `|‾‾‾‾‾‾‾‾‾‾‾( 2 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[2] = {name: '|--------MANA--------|', value: `|‾‾‾‾‾‾‾‾‾‾( 4 )‾‾‾‾‾‾‾‾‾‾|`, inline: true};
            fields[3] = {name: '\u200b', value: 'People think you\'re nothing but a drunk, but they don\'t realize your secrets. Conquer your foes with your charm... and maybe a hidden knife up your sleeve, who knows what you\'re hiding'};
            break;
    }

    classObject.fields = fields;
    return classObject;
}

/**
 * Displays information about the classes.
 * @param {string} className The name of the class.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function classHelpMenu(className, msg) {
    if (className) className = className.toLowerCase();
    if (!className || (className !== 'paladin' && className !== 'juggernaut' && className !== 'assassin' && className !== 'wizard' && className !== 'cleric' && className !== 'archmage' && className !== 'bard')) {
        const classListEmbed = {
            color: 0xc2f542,
            title: `Class List`,
            author: {
                name: 'Dungeon master',
                icon_url: 'https://i.imgur.com/MivKiKL.png'
            },
            thumbnail: {
                url: 'https://i.imgur.com/nFdghga.png',
            },
            fields: [
                {name: '**Juggernaut**', value: '`!class juggernaut` to learn more.', inline: true},
                {name: '**Assassin**', value: '`!class assassin` to learn more.', inline: true},
                {name: '**Wizard**', value: '`!class wizard` to learn more.', inline: true},
                {name: '**Cleric**', value: '`!class cleric` to learn more.', inline: true},
                {name: '**Paladin**', value: '`!class Paladin` to learn more.', inline: true},
                {name: '**Archmage**', value: '`!class archmage` to learn more.', inline: true},
                {name: '**Bard**', value: '`!class bard` to learn more.', inline: true}
            ]
        };

        return msg.channel.send({embed: classListEmbed});
    }

    let classFields = getClassFields(className);
    const classInfoEmbed = {
        color: 0xc2f542,
        title: `${className.charAt(0).toUpperCase() + className.slice(1)}`,
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: classFields.url,
        },
        fields: classFields.fields,
    };

    return msg.channel.send({embed: classInfoEmbed});
}

exports.helpMenu = helpMenu;
exports.classHelpMenu = classHelpMenu;
exports.infoCommandHelpMenu = infoCommandHelpMenu;
exports.combatHelpMenu = combatHelpMenu;
exports.inventoryHelpMenu = inventoryHelpMenu;
