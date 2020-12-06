const Discord = require('discord.js'),
    fs = require('fs'),
    error = require('../util/error'),
    getInfo = require('../gameInfo/getInfo'),
    writeInfo = require('../gameInfo/writeInfo');

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
 * Checks if any existing game is the currently active game.
 * @param {object} msg Contains information about the command sent by the player through discord.
 * @param {function} callback Callback function.
 */
function _checkForActiveGame(msg, callback) {
    fs.readdir("gameData", (err, directories) => {
        if (err) {
            error.error("Failed to read game information folder.", null, msg);
            return true;
        }

        let dirLen = directories.length;
        let counter = 0;

        directories.forEach((directory) => {
            getInfo.getGameInfo(directory, msg, (gameInfo) => {
                if (gameInfo.activeGame) {
                    error.error(`Campaign \`${gameInfo.title}\` is currently active.`, `Notify ${gameInfo.host} to \`!pause ${gameInfo.title}\` or \`!end ${gameInfo.title}\`.`, msg);
                    callback(true);
                    return;
                }
                counter++;

                // All files are read and no active games are found.
                if (counter === dirLen) {
                    callback(false);
                    return;
                }
            })
        });
    });
}

/**
 * Check if the user is the host.
 * @param {int} hostID The host id.
 * @param {int} userID The user id.
 */
function _isHost(hostID, userID) {
    return hostID === userID;
}

/**
 * Removes all newly added reactions so that only 1 reaction is present at any time.
 * @param {reaction} reaction Reaction object.
 */
function _removeReaction(reaction) {
    reaction.users.cache.forEach(user => {
        if (!user.bot) {
            reaction.users.remove(user.id);
        }
    });
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
                channel.send(`${hostRole} ${playerRole} here is a private channel where you can run bot commands.`);
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
        let hostUser = msg.guild.members.cache.get(client.users.cache.find(user => user.username === gameObject.host).id);
        hostUser.roles.add(msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_host`)).catch(error => {
            msg.channel.send(`Due to permission errors, I was unable to assign the role \`${gameObject.title}_host\` to ${gameObject.host}`);
        });

        // Assign the player roles.
        gameObject.players.forEach(player => {
            let playerUser = msg.guild.members.cache.get(client.users.cache.find(user => user.username === player).id);
            playerUser.roles.add(msg.guild.roles.cache.find(role => role.name === `${gameObject.title}_player`)).catch(error => {
                msg.channel.send(`Due to permission errors, I was unable to assign the role \`${gameObject.title}_player\` to ${player}`);
            });
        });

        _createChannels(gameObject, msg, newObject => {
            callback(newObject);
        });
    });
}

function _generateUI(gameName, client, msg) {
    let gameObject = {};

    gameObject.title = gameName;
    gameObject.host = msg.member.user.username;
    gameObject.players = [];
    gameObject.declined = [];
    gameObject.hostChannel = null;
    gameObject.playerChannel = null;
    gameObject.gameCategory = null;
    gameObject.archived = false;
    gameObject.activeGame = true;

    const setupEmbed = _getGameStartupEmbed(gameObject);
    const tempUserInfo = {};

    // Set the message and setup emotes.
    msg.channel.send(setupEmbed).then(async gameSetupEmbed => {
        await gameSetupEmbed.react("✅");
        await gameSetupEmbed.react("❌");
        await gameSetupEmbed.react("👍");
        await gameSetupEmbed.react("🗑️");

        const filter = (reaction, user) => {
            tempUserInfo.name = user.username;
            return ["✅", "❌", "👍", "🗑️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = gameSetupEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "✅":
                    // Player wants to join the campaign.
                    if (!gameObject.players.includes(tempUserInfo.name) && !_isHost(gameObject.host, tempUserInfo.name)) {
                        if (gameObject.declined.includes(tempUserInfo.name)) {
                            // Remove name from the 'declined' list.
                            gameObject.declined = gameObject.declined.filter(newArray => newArray !== tempUserInfo.name);
                        }
                        gameObject.players.push(tempUserInfo.name);
                        const updatedEmbed = _getGameStartupEmbed(gameObject, gameObject.players, gameObject.declined);
                        gameSetupEmbed.edit(updatedEmbed);
                    }
                    break;
                case "❌":
                    // Player does not want to join the campaign.
                    if (!gameObject.declined.includes(tempUserInfo.name) && !_isHost(gameObject.host, tempUserInfo.name)) {
                        if (gameObject.players.includes(tempUserInfo.name)) {
                            // Remove name from the 'accepted' list.
                            gameObject.players = gameObject.players.filter(newArray => newArray !== tempUserInfo.name);
                        }
                        gameObject.declined.push(tempUserInfo.name);
                        const updatedEmbed = _getGameStartupEmbed(gameObject, gameObject.players, gameObject.declined);
                        gameSetupEmbed.edit(updatedEmbed);
                    }
                    break;
                case "👍":
                    // FIXME
                    // Host can start the game from there. This will generate the game file.
                    if (_isHost(gameObject.host, tempUserInfo.name) /*&& gameObject.players.length > 0*/) {
                        _checkForActiveGame(msg, isActive => {
                            if (isActive) {
                                return;
                            }
                            gameSetupEmbed.delete()
                            msg.channel.send(`Campaign \`${gameObject.title}\` has been created.`);

                            _setRoles(gameObject, client, msg, newObject => {
                                writeInfo.createGame(newObject, msg);
                            });
                            return;
                        });
                    }
                    break;
                case "🗑️":
                    // Host can cancel the campaign.
                    if (_isHost(gameObject.host, tempUserInfo.name)) {
                        gameSetupEmbed.delete()
                        msg.channel.send(`Campaign \`${gameObject.title}\` has been cancelled.`);
                        return;
                    }
                    break;
            }
            _removeReaction(reaction);
        });
    });
}

/**
 * Setup the UI for the newly generated game. Allows for players to join / decline joining the game.
 * @param {string} rawInput The raw user input.
 * @param {object} msg Contains information about the command sent by the player through discord.
 */
function setupGame(rawInput, client, msg) {
    let gameName = _getGameName(rawInput);

    // Throws an error if a host tries to re-create their game.
    if (fs.existsSync(`gameData/${gameName}`)) {
        return error.error("A campaign of this title has already been made.", null, msg);
    }

    _checkForActiveGame(msg, isActive => {
        if (isActive) {
            return;
        }
        _generateUI(gameName, client, msg);
    });
}

function _getGameEndEmbed(gameObject) {
    return new Discord.MessageEmbed()
        .setColor("0xb04360")
        .setTitle("Ending Campaign: " + gameObject.title)
        .setAuthor("Dungeon Master", "https://i.imgur.com/MivKiKL.png")
        .setDescription("Do you want to delete or preserve the game data?")
        .addFields(
            {name: "✅ Full Wipe", value: "This will delete all related channels + roles + game data.", inline: true},
            {name: "☑️ Partial Wipe", value: "Related channels will be archived and available for all to view + game files will be saved. Roles will be deleted. (Perfect if you want to keep the memories)", inline: true}
        )
        .setFooter("Or you can ❌ to cancel.")
}

function _deleteRoles(gameName, msg) {
    try {
        msg.guild.roles.cache.find(role => role.name === `${gameName}_host`).delete();
        msg.guild.roles.cache.find(role => role.name === `${gameName}_player`).delete();
    } catch (err) {
        console.log("Error deleting role(s). Were they already deleted?");
    }
}

function _deleteChannels(gameName, msg) {
    msg.guild.channels.cache.find(channel => channel.name === `${gameName}_host_channel`).delete().catch(err => {
        console.log(`${gameName}_host_channel was not found`);
    });
    msg.guild.channels.cache.find(channel => channel.name === `${gameName}_player_channel`).delete().catch(err => {
        console.log(`${gameName}_player_channel was not found`);
    });
    msg.guild.channels.cache.find(channel => channel.name === `${gameName}_campaign`).delete().catch(err => {
        console.log(`${gameName}_campaign was not found`);
    });
}

function _wipeGameFile(path) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);

        if (files.length > 0) {
            files.forEach(filename => {
                if (fs.statSync(`${path}/${filename}`).isDirectory()) {
                    _wipeGameFile(`${path}/${filename}`);
                } else {
                    fs.unlinkSync(`${path}/${filename}`);
                }
            });
        }
        fs.rmdirSync(`${path}`);
    }
}

function _archiveChannels(gameName, msg, callback) {
    try {
        msg.guild.channels.cache.find(name => name.name === `${gameName}_campaign`).overwritePermissions([
            {
                id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }
        ]).then(() => {
            msg.guild.channels.cache.find(name => name.name === `${gameName}_host_channel`).overwritePermissions([
                {
                    id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                    allow: ["VIEW_CHANNEL"],
                    deny: ["SEND_MESSAGES"]
                }
            ]).then (() => {
                msg.guild.channels.cache.find(name => name.name === `${gameName}_player_channel`).overwritePermissions([
                    {
                        id: msg.guild.roles.cache.find(role => role.name === `@everyone`).id,
                        allow: ["VIEW_CHANNEL"],
                        deny: ["SEND_MESSAGES"]
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

function _generateEndUI(gameObject, msg) {
    const endEmbed = _getGameEndEmbed(gameObject);
    const tempUserInfo = {};
    // Set the message and setup emotes.
    msg.channel.send(endEmbed).then(async gameSetupEmbed => {
        await gameSetupEmbed.react("✅");
        await gameSetupEmbed.react("☑️");
        await gameSetupEmbed.react("❌");

        const filter = (reaction, user) => {
            tempUserInfo.name = user.username;
            return ["✅", "❌", "☑️"].includes(reaction.emoji.name);
        }

        // Handle the reactions.
        const collector = gameSetupEmbed.createReactionCollector(filter);
        collector.on('collect', reaction => {
            switch (reaction.emoji.name) {
                case "✅":
                    // Player wants to perform a full wipe on the game.
                    if (_isHost(gameObject.host, tempUserInfo.name)) {
                        gameSetupEmbed.delete();
                        _wipeGameFile(`gameData/${gameObject.title}`);
                        _deleteChannels(gameObject.title, msg);
                        _deleteRoles(gameObject.title, msg);
                        msg.channel.send(`Campaign \`${gameObject.title}\` has fully deleted.`);
                        return;
                    }
                    break;
                case "❌":
                    // Player does not want to cancel the game.
                    if (_isHost(gameObject.host, tempUserInfo.name)) {
                        gameSetupEmbed.delete();
                        msg.channel.send(`No action taken.`);
                        return;
                    }
                    break;
                case "☑️":
                    // Archive game.
                    if (_isHost(gameObject.host, tempUserInfo.name)) {
                        gameSetupEmbed.delete();
                        _deleteRoles(gameObject.title, msg);
                        _archiveChannels(gameObject.title, msg, () => {
                            gameObject.hostChannel = null;
                            gameObject.playerChannel = null;
                            gameObject.gameCategory = null;
                            gameObject.archived = true;
                            gameObject.activeGame = false;
                            writeInfo.updateGame(gameObject, msg);
                            msg.channel.send(`Campaign \`${gameObject.title}\` has been archived.`);
                            return;
                        });
                    }
                    break;
            }
            _removeReaction(reaction);
        });
    });
}

function endGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    getInfo.getGameInfo(gameName, msg, gameObject => {
        if (!_isHost(gameObject.host, msg.author.username)) {
            return error.error("Only the host of the game can perform this action.", null, msg);
        } else if (gameObject.archived) {
            return error.error("The game is archived.", "You will need to manually delete the files.", msg);
        }
        _generateEndUI(gameObject, msg);
    });
}

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

function pauseGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    getInfo.getGameInfo(gameName, msg, gameObject => {
        if (gameObject.activeGame) {
            gameObject.activeGame = false;
            _pauseChannel(gameName, msg);
            writeInfo.updateGame(gameObject, msg);
            msg.channel.send(`\`${gameObject.title}\` has been paused.`);
        } else {
            return error.error("This is not an active game.", `\`!play ${gameName}\` to set it as an active game.`, msg);
        }
    });
}

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

function playGame(rawInput, msg) {
    let gameName = _getGameName(rawInput);
    _checkForActiveGame(msg, isActive => {
        if (isActive) {
            return;
        }
        getInfo.getGameInfo(gameName, msg, gameObject => {
            gameObject.activeGame = true;
            _playChannel(gameObject.title, msg, () => {
                writeInfo.updateGame(gameObject, msg, () => {
                    msg.channel.send(`\`${gameObject.title}\` is now the active game.`);
                });
            });
        });
    });
}

exports.setupGame = setupGame;
exports.endGame = endGame;
exports.pauseGame = pauseGame;
exports.playGame = playGame;
