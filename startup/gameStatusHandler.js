const Discord = require("discord.js"),
    error = require("../util/error"),
    player = require("./classSelection"),
    ui = require("../util/UImethods"),
    db = require("../databaseHandler/dbHandler");

/**
 * Concatinates the user input to create the Campaign Name.
 * @param {string} rawInput The raw user input.
 */
function _getGameName(rawInput) {
    let gameName = "";
    for (let i = 1; i < rawInput.length; i++) {
        gameName += rawInput[i] + "_";
    }
    return gameName.slice(0, -1).toLowerCase();
}

/**
 * Generates the embed detailing the game info and a list of accepted / declined users.
 * @param {object} gameObject The game object.
 * @param {string[]} acceptedList Accepted player list.
 * @param {string[]} declinedList Declined player list.
 */
function _getGameStartupEmbed(gameObject, acceptedList = "-", declinedList = "-") {
    if (acceptedList.length === 0) {
        acceptedList = "-";
    }
    if (declinedList.length === 0) {
        declinedList = "-";
    }

    return new Discord.MessageEmbed()
        .setColor("0xb04360")
        .setTitle("New Campaign: " + gameObject.title)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Hosted By: " + gameObject.host)
        .addFields(
            {name: "✅ Accepted", value: acceptedList, inline: true},
            {name: "❌ Declined", value: declinedList, inline: true}
        )
        .setFooter(`${gameObject.host} can 👍 to start the game.\nOr 🗑️ to cancel the game.`);
}

/**
 * Creates the game category and 2 channels:
 *  - Host channel (private to the host)
 *  - Player channel (available to all players and the host)
 * @param {object} gameObject The game object.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {function} callback The callback function.
 */
function _createChannels(gameObject, msg, callback) {
    // Create the category.
    msg.guild.channels.create(`${gameObject.title}_campaign`, {
        type: "category"
    }).then(category => {
        gameObject.gameCategory = category.id;
        category.overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_host`).id,
                allow: ["VIEW_CHANNEL"]
            },
            {
                id: msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_player`).id,
                allow: ["VIEW_CHANNEL"]
            }
        ]);

        // Create the host channel.
        msg.guild.channels.create(`${gameObject.title}_host_channel`, {
            type: "text",
            permissionOverwrites: [
                {
                    id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_host`).id,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(channel => {
            channel.setParent(category.id);

            let hostRole = roles.cache.find(role => role.name === `${gameObject.title}_host`);
            channel.send(`${hostRole} this is your private channel where you can run \`!admin\` commands.`);
            gameObject.hostChannel = channel.id;
        }).then(() => {

            // Create the player channel.
            msg.guild.channels.create(`${gameObject.title}_player_channel`, {
                type: "text",
                permissionOverwrites: [
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_host`).id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_player`).id,
                        allow: ["VIEW_CHANNEL"]
                    }
                ]
            }).then(channel => {
                channel.setParent(category.id);

                let hostRole = roles.cache.find(role => role.name === `${gameObject.title}_host`);
                let playerRole = roles.cache.find(role => role.name === `${gameObject.title}_player`);
                channel.send(`${hostRole} ${playerRole} here is a private channel where you can run bot commands. \`!help\` to get started.`);
                gameObject.playerChannel = channel.id;

                callback(gameObject);
            });
        });
    })
}

/**
 * Creates the roles if they do not already exist.
 * @param {string} gameName The name of the campaign.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _createRoles(gameName, msg, callback) {
    roles = msg.guild.roles;

    // Create the host role.
    roles.create({
        data: {
            name: `${gameName}_host`,
            color: "PURPLE",
            permissions: [
                "MANAGE_CHANNELS",
                "ADD_REACTIONS",
                "PRIORITY_SPEAKER",
                "STREAM",
                "VIEW_CHANNEL",
                "SEND_MESSAGES",
                "MANAGE_MESSAGES",
                "ATTACH_FILES",
                "READ_MESSAGE_HISTORY",
                "MENTION_EVERYONE",
                "CONNECT",
                "SPEAK",
                "CHANGE_NICKNAME",
                "MANAGE_ROLES",
            ]
        }
    }).then(() => {
        // Create the player role.
        roles.create({
            data: {
                name: `${gameName}_player`,
                color: "BLUE",
                permissions: [
                    "ADD_REACTIONS",
                    "VIEW_CHANNEL",
                    "SEND_MESSAGES",
                    "ATTACH_FILES",
                    "READ_MESSAGE_HISTORY",
                    "CONNECT",
                    "SPEAK"
                ]
            }
        }).then(() => {
            callback();
        })
    });
}

/**
 * Assigns the new host & player roles to the host / players.
 * @param {object} gameObject The game object.
 * @param {object} client The bot / client.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {function} callback Callback function.
 */
function _setRoles(gameObject, client, msg, callback) {
    _createRoles(gameObject.title, msg, () => {
        // Assign the host role.
        let hostUser = msg.guild.members.cache.get(msg.client.users.cache.find(user => user.username === gameObject.host).id);
        hostUser.roles.add(msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_host`)).catch(error => {
            msg.channel.send(`Due to permission errors, I was unable to assign the role \`${gameObject.title}_host\` to ${gameObject.host}`);
        });

        // Assign the player roles.
        gameObject.players.forEach(player => {
            let playerUser = msg.guild.members.cache.get(msg.client.users.cache.find(user => user.username === player).id);
            playerUser.roles.add(msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_player`)).catch(error => {
                msg.channel.send(`Due to permission errors, I was unable to assign the role \`${gameObject.title}_player\` to ${player}`);
            });
        });

        _createChannels(gameObject, msg, newObject => {
            callback(newObject);
        });
    });
}

/**
 * Sets up the UI and assigns logic to the reactions.
 * @param {*} gameName The name of the game.
 * @param {object} client The bot / client.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _generateCreationUI(gameName, msg) {
    let gameObject = {};

    gameObject.title = gameName;
    gameObject.host = msg.member.user.username;
    gameObject.players = ["Laggy"];
    gameObject.declined = [];
    gameObject.hostChannel = null;
    gameObject.playerChannel = null;
    gameObject.gameCategory = null;
    gameObject.archived = 0;
    gameObject.activeGame = 1;

    const setupEmbed = _getGameStartupEmbed(gameObject);
    let inputUserName = {};

    // Set the message and setup emotes.
    msg.channel.send(setupEmbed).then(async gameSetupEmbed => {
        await gameSetupEmbed.react("✅");
        await gameSetupEmbed.react("❌");
        await gameSetupEmbed.react("👍");
        await gameSetupEmbed.react("🗑️");

        const filter = (reaction, user) => {
            inputUserName = user.username;
            return ["✅", "❌", "👍", "🗑️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = gameSetupEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "✅":
                    // Player wants to join the campaign.
                    if (!gameObject.players.includes(inputUserName) && !ui.isHost(gameObject.host, inputUserName)) {
                        if (gameObject.declined.includes(inputUserName)) {
                            // Remove name from the 'declined' list.
                            gameObject.declined = gameObject.declined.filter(newArray => newArray !== inputUserName);
                        }
                        gameObject.players.push(inputUserName);
                        const updatedEmbed = _getGameStartupEmbed(gameObject, gameObject.players, gameObject.declined);
                        gameSetupEmbed.edit(updatedEmbed);
                    }
                    break;
                case "❌":
                    // Player does not want to join the campaign.
                    if (!gameObject.declined.includes(inputUserName) && !ui.isHost(gameObject.host, inputUserName)) {
                        if (gameObject.players.includes(inputUserName)) {
                            // Remove name from the 'accepted' list.
                            gameObject.players = gameObject.players.filter(newArray => newArray !== inputUserName);
                        }
                        gameObject.declined.push(inputUserName);
                        const updatedEmbed = _getGameStartupEmbed(gameObject, gameObject.players, gameObject.declined);
                        gameSetupEmbed.edit(updatedEmbed);
                    }
                    break;
                case "👍":
                    // FIXME
                    // Host can start the game from there. This will generate the game file.
                    if (ui.isHost(gameObject.host, inputUserName) /*&& gameObject.players.length > 0*/) {
                        db.getActiveGame(isActive => {
                            if (isActive) {
                                return error.error(`Campaign \`${isActive.title}\` is currently active.`, `Notify ${isActive.host} to \`!pause ${isActive.title}\` or \`!end ${isActive.title}\`.`, msg);
                            }
                            gameSetupEmbed.delete();

                            _setRoles(gameObject, msg.client, msg, newObject => {
                                db.insertGame(newObject);
                                msg.channel.send(`Campaign \`${newObject.title}\` has been created.`);

                                newObject.players.forEach(playerName => {
                                    player.generateClassSelectionUI(newObject, playerName, msg);
                                });
                            });
                            return;
                        });
                    }
                    break;
                case "🗑️":
                    // Host can cancel the campaign.
                    if (ui.isHost(gameObject.host, inputUserName)) {
                        gameSetupEmbed.delete();
                        msg.channel.send(`Campaign \`${gameObject.title}\` has been cancelled.`);
                        return;
                    }
                    break;
            }
            ui.removeReaction(reaction);
        });
    });
}

/**
 * Setup the UI for the newly generated game. Allows for players to join / decline joining the game.
 * @param {string} rawInput The raw user input.
 * @param {object} client The bot / client.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function setupGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);

    db.getGameInfo(gameName, gameObject => {
        if (gameObject) {
            return error.error("A campaign of this title has already been made.", null, msg);
        }

        db.getActiveGame(isActive => {
            if (isActive) {
                return error.error(`Campaign \`${isActive.title}\` is currently active.`, `Notify ${isActive.host} to \`!pause ${isActive.title}\` or \`!end ${isActive.title}\`.`, msg);
            }

            _generateCreationUI(gameName, msg);
        });
    })
}

/**
 * Generate a UI for the ending-a-game screen.
 * @param {object} gameObject The game object.
 */
function _getGameEndEmbed(gameObject) {
    return new Discord.MessageEmbed()
        .setColor("0xb04360")
        .setTitle("Ending Campaign: " + gameObject.title)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Do you want to delete or preserve the game data?")
        .addFields(
            {name: "✅ Full Wipe", value: "This will delete all related channels + roles + game data.", inline: true},
            {name: "☑️ Preserve", value: "Related channels will be archived and available for all to view + game files will be saved. Roles will be deleted. (Perfect if you want to keep the memories)", inline: true}
        )
        .setFooter("Or you can ❌ to cancel.")
}

/**
 * Deletes all roles associated with the game.
 * @param {string} gameName The name of the game.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _deleteRoles(gameName, msg) {
    try {
        msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).delete();
        msg.guild.roles.cache.find(role => role.name === `${gameName}_player`).delete();
    } catch (err) {
        console.log("Error deleting role(s). Were they already deleted?");
    }
}

/**
 * Deletes all channels associated with the game.
 * @param {string} gameName The game name.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _deleteChannels(gameName, msg) {
    try {
        msg.guild.channels.cache.find(channel => channel.name === `${gameName}_host_channel`).delete();
        msg.guild.channels.cache.find(channel => channel.name === `${gameName}_player_channel`).delete();
        msg.guild.channels.cache.find(channel => channel.name === `${gameName}_campaign`).delete();
    } catch (err) {
        console.log("Error deleting the channels");
    }
}

/**
 * Archives all channels associated with the game.
 * @param {string} gameName The game name.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _archiveChannels(gameName, msg) {
    try {
        msg.guild.channels.cache.find(name => name.name === `${gameName}_campaign`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }
        ]);
        msg.guild.channels.cache.find(name => name.name === `${gameName}_host_channel`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }
        ]);
        msg.guild.channels.cache.find(name => name.name === `${gameName}_player_channel`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }
        ]);
    } catch (err) {
        console.log("Error changing channel permissions");
    }
}

/**
 * Sets up the ending-a-game UI and assigns logic to the reactions.
 * @param {string} gameObject The game object.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _generateEndUI(gameObject, msg) {
    const endEmbed = _getGameEndEmbed(gameObject);
    let inputUserName;
    // Set the message and setup emotes.
    msg.channel.send(endEmbed).then(async gameSetupEmbed => {
        await gameSetupEmbed.react("✅");
        await gameSetupEmbed.react("☑️");
        await gameSetupEmbed.react("❌");

        const filter = (reaction, user) => {
            inputUserName = user.username;
            return ["✅", "❌", "☑️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = gameSetupEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "✅":
                    // Player wants to perform a full wipe on the game.
                    if (ui.isHost(gameObject.host, inputUserName)) {
                        gameSetupEmbed.delete();
                        db.deleteGame(gameObject.title);
                        _deleteChannels(gameObject.title, msg);
                        _deleteRoles(gameObject.title, msg);
                        msg.channel.send(`Campaign \`${gameObject.title}\` has fully deleted.`);
                        return;
                    }
                    break;
                case "❌":
                    // Player does not want to cancel the game.
                    if (ui.isHost(gameObject.host, inputUserName)) {
                        gameSetupEmbed.delete();
                        msg.channel.send(`No action taken.`);
                        return;
                    }
                    break;
                case "☑️":
                    // Archive game.
                    if (ui.isHost(gameObject.host, inputUserName)) {
                        gameSetupEmbed.delete();
                        _deleteRoles(gameObject.title, msg);
                        _archiveChannels(gameObject.title, msg);
                        db.archiveGame(gameObject.title);
                        msg.channel.send(`Campaign \`${gameObject.title}\` has been archived.`);
                        return;
                    }
                    break;
            }
            ui.removeReaction(reaction);
        });
    });
}

/**
 * Allows the user to end the game (delete all files or archive it).
 * @param {string[]} rawInput The raw user input.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function endGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    db.getGameInfo(gameName, gameObject => {
        if (!_checkIfModifiable(gameObject, msg)) {
            return;
        }
        _generateEndUI(gameObject, msg);
    });
}

/**
 * Disables everyone from typing into the channels.
 * @param {string} gameName The name of the game.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _pauseChannel(gameName, msg) {
    try {
        msg.guild.channels.cache.find(name => name.name === `${gameName}_campaign`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }
        ]).then(() => {
            msg.guild.channels.cache.find(name => name.name === `${gameName}_player_channel`).overwritePermissions([
                {
                    id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                    allow: ["VIEW_CHANNEL"],
                    deny: ["SEND_MESSAGES"]
                }
            ]).then(() => {
                msg.guild.channels.cache.find(name => name.name === `${gameName}_host_channel`).overwritePermissions([
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).id,
                        allow: ["VIEW_CHANNEL"],
                        deny: ["SEND_MESSAGES"]
                    }
                ])
            });
        });
    } catch (err) {
        console.log("Error changing channel permissions");
    }
}

/**
 * Pauses the game if it is active.
 * @param {string[]} rawInput The raw user input.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function pauseGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    db.getGameInfo(gameName, gameObject => {
        if (!_checkIfModifiable(gameObject, msg)) {
            return;
        }
        if (gameObject.activeGame) {
            db.pauseGame(gameName);
            _pauseChannel(gameName, msg);
            msg.channel.send(`\`${gameObject.title}\` has been paused.`);
        } else {
            return error.error("This is not an active game.", `\`!play ${gameName}\` to set it as an active game.`, msg);
        }
    });
}

/**
 * Allows players to type into the game channel.
 * @param {string} gameName The game name.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {function} callback The callback function.
 */
function _playChannel(gameName, msg, callback) {
    try {
        msg.guild.channels.cache.find(name => name.name === `${gameName}_campaign`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).id,
                allow: ["VIEW_CHANNEL"]
            },
            {
                id: msg.guild.roles.cache.find(role => role.name === `${gameName}_player`).id,
                allow: ["VIEW_CHANNEL"]
            }
        ]).then(() => {
            msg.guild.channels.cache.find(name => name.name === `${gameName}_host_channel`).overwritePermissions([
                {
                    id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).id,
                    allow: ["VIEW_CHANNEL"]
                }
            ]).then (() => {
                msg.guild.channels.cache.find(name => name.name === `${gameName}_player_channel`).overwritePermissions([
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `${gameName}_player`).id,
                        allow: ["VIEW_CHANNEL"]
                    }
                ]).then(() => {
                    callback();
                });
            });
        });
    } catch (err) {
        console.log("Error changing channel permissions");
    }
}

/**
 * Sets the game as active.
 * @param {string} rawInput The raw user input.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function playGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    db.getActiveGame(isActive => {
        if (isActive) {
            return error.error(`Campaign \`${isActive.title}\` is currently active.`, `Notify ${isActive.host} to \`!pause ${isActive.title}\` or \`!end ${isActive.title}\`.`, msg);
        }
        db.getGameInfo(gameName, gameObject => {
            if (!_checkIfModifiable(gameObject, msg)) {
                return;
            }
            db.playGame(gameName);
            _playChannel(gameObject.title, msg, () => {
                msg.channel.send(`\`${gameObject.title}\` is now the active game.`);
            });
        });
    });
}

/**
 * Checks if the game can be modified.
 * @param {object} gameObject The game object.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function _checkIfModifiable(gameObject, msg) {
    if (!gameObject) {
        error.error("This game does not exist.", `\`!create ${gameName}\` to start a new game.`, msg);
        return false;
    } else if (gameObject.archived) {
        error.error("This game is archived.", "Archived games cannot be modified.", msg);
        return false;
    } else if (!ui.isHost(gameObject.host, msg.author.username)) {
        error.error("Only the host can modify the status of the game", `Contact \`${gameObject.host}\` to help you out.`, msg);
        return false;
    }
    return true;
}

exports.setupGame = setupGame;
exports.endGame = endGame;
exports.pauseGame = pauseGame;
exports.playGame = playGame;
