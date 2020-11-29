const error = require('../util/error');

/**
 * Populates the 'fields' parameter for the Embed.
 * @returns {array} The array of fields.
 */
function getFields() {
    fields = [];
    fields[0] = {name: '`!admin`', value: 'Admin help page'};
    fields[1] = {name: '`!add <player> <class> <item> <#>`', value: 'Gives a player an item. The last entry is optional.'};
    fields[2] = {name: '`!remove <player> <class> <item>`', value: 'Removes the item from the player info.'};   
    fields[3] = {name: '`!damage <mp/hp> <player> <#>`', value: 'Removes "#" from player hp/mp'};
    fields[4] = {name: '`!heal <mp/hp> <player> <#>`', value: 'Adds "#" to player hp/mp'};
    fields[5] = {name: '`!init <optional: #>`', value: 'Rolls the dice for all players. Uses a D20 as default.'};
    fields[6] = {name: '`!init-enemy <# of enemies> <optional: Dice Size>`', value: 'Rolls the dice for all enemies using a D20 as a default, or you can set it.'};
    fields[7] = {name: '`!init-all <# of enemies> <optional: Dice Size>`', value: 'Rolls the dice for all player + enemies using a D20 as a default, or you can set it.'};
    fields[8] = {name: '`!view <player>`', value: 'View the character info for a player.'};  
    fields[9] = {name: '`!max <hp/str/mp> <player> <#>`', value: 'Sets the players total stat to the requested amount.'}; 
    fields[10] = {name: '`!ally <name> <hp #> <str #> <mp #>`', value: 'Creates an ally.'}; 
    fields[11] = {name: '`!kill <ally>`', value: 'Kills an ally.'};
    fields[12] = {name: '`!admin-equip <name> <item>`', value: 'Force equips an item for a player.'};
    fields[13] = {name: '`!admin-cast <ally> <spell> <target (if healing spell)>`', value: 'Casts a spell for a player.'};
    fields[14] = {name: '`!admin-activate <name> <ability>`', value: 'Activates an ability for the specified player.'};
    fields[15] = {name: '`!add-inv <#> <name>`', value: 'Increase the players max-inventory.'};
    fields[16] = {name: '`!remove-inv <#> <name>`', value: 'Reduce the players max-inventory.'};
    fields[17] = {name: '`!purge <#>`', value: 'Delete a certain # of messages in the chat.'};

    return fields;
}

/**
 * Displays the list of commands that the bot can perform for the admin.
 * @param {object} msg The object containing information about the message sent through discord.
 */
function adminHelp(msg) {
    if (!msg.member._roles.includes('727195200681934969')) return error.error('You need to be hosting the game to run this command.', msg);

    const helpEmbed = {
        color: 0xb04360,
        title: 'Dungeon Master Command List',
        author: {
            name: 'Dungeon master',
            icon_url: 'https://i.imgur.com/MivKiKL.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/MivKiKL.png',
        },
        fields: getFields(),
        footer: {
            text: 'All commands are lowercase.'
        }
    };

    return msg.channel.send({embed: helpEmbed});
}

exports.adminHelp = adminHelp;
