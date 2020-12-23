const sqlite3 = require("sqlite3").verbose(),
    setActive = require("../main"),
    error = require("../util/error");

function createDB() {
    let db = new sqlite3.Database("dungeon.db");

    db.get("PRAGMA foreign_keys = ON;");

    db.run(
        `CREATE TABLE IF NOT EXISTS game (
            game_title TEXT NOT NULL,
            host TEXT,
            players TEXT,
            declined TEXT,
            hostChannel TEXT,
            playerChannel TEXT,
            gameCategory TEXT,
            archived INTEGER,
            activeGame INTEGER,
            PRIMARY KEY (game_title)
        );`, () => {
            getActiveGame();
        }
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS player (
            username TEXT NOT NULL,
            class TEXT NOT NULL,
            image TEXT,
            money INTEGER,
            game_title TEXT,
            isBot INTEGER,
            weapon TEXT,
            clothing TEXT,
            maxInventory INTEGER,
            armor INTEGER,
            bonusSpell INTEGER,
            bonusHealing INTEGER,
            luck INTEGER,
            health INTEGER,
            maxHealth INTEGER,
            strength INTEGER,
            mana INTEGER,
            maxMana INTEGER,
            PRIMARY KEY (username, game_title),
            FOREIGN KEY (game_title) REFERENCES game ON DELETE CASCADE
        );`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS items (
            item_name TEXT NOT NULL,
            equipable INTEGER,
            description TEXT,
            image TEXT,
            weapon INTEGER,
            bonusHealth INTEGER,
            bonusStrength INTEGER,
            bonusMana INTEGER,
            bonusArmor INTEGER,
            bonusSpell INTEGER,
            bonusHealing INTEGER,
            bonusLuck INTEGER,
            PRIMARY KEY (item_name)
        );`, (err) => {
            db.run(`INSERT OR IGNORE INTO items VALUES (
                :item_name,
                :equipable,
                :description,
                :image,
                :weapon,
                :bonusHealth,
                :bonusStrength,
                :bonusMana,
                :bonusArmor,
                :bonusSpell,
                :bonusHealing,
                :bonusLuck
            );`,
            ["bare_fist",1,"Just your bare fists.","https://i.imgur.com/trX6GKf.png",1,0,0,0,0,0,0,0]);

            db.run(`INSERT OR IGNORE INTO items VALUES (
                :item_name,
                :equipable,
                :description,
                :image,
                :weapon,
                :bonusHealth,
                :bonusStrength,
                :bonusMana,
                :bonusArmor,
                :bonusSpell,
                :bonusHealing,
                :bonusLuck
            );`,
            ["torn_clothing",1,"The bare necessities.","https://imgur.com/9YvRj1P.png",0,0,0,0,0,0,0,0]);
        }
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS spells (
            spell_name TEXT NOT NULL,
            description TEXT,
            image TEXT,
            type TEXT,
            mana_cost INTEGER,
            damage INTEGER,
            bonus_roll INTEGER,
            PRIMARY KEY (spell_name)
        );`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS player_spells (
            spell_name TEXT NOT NULL,
            username TEXT NOT NULL,
            game_title TEXT NOT NULL,
            PRIMARY KEY (spell_name, username, game_title),
            FOREIGN KEY (spell_name) REFERENCES spells ON DELETE CASCADE,
            FOREIGN KEY (username) REFERENCES player ON DELETE CASCADE,
            FOREIGN KEY (game_title) REFERENCES game ON DELETE CASCADE
        );`
    )

    db.run(
        `CREATE TABLE IF NOT EXISTS player_items (
            item_name TEXT NOT NULL,
            username TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            game_title TEXT NOT NULL,
            PRIMARY KEY (username, item_name, game_title),
            FOREIGN KEY (username) REFERENCES player ON DELETE CASCADE,
            FOREIGN KEY (item_name) REFERENCES items ON DELETE CASCADE,
            FOREIGN KEY (game_title) REFERENCES game ON DELETE CASCADE
        );`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS player_journal (
            entry_name TEXT NOT NULL,
            username TEXT NOT NULL,
            description TEXT NOT NULL,
            game_title TEXT NOT NULL,
            PRIMARY KEY (username, entry_name),
            FOREIGN KEY (username) REFERENCES player ON DELETE CASCADE,
            FOREIGN KEY (game_title) REFERENCES game ON DELETE CASCADE
        );`
    );

    db.close();
}

function newItem(io) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `INSERT INTO items VALUES (
            :item_name,
            :equipable,
            :description,
            :image,
            :weapon,
            :bonusHealth,
            :bonusStrength,
            :bonusMana,
            :bonusArmor,
            :bonusSpell,
            :bonusHealing,
            :bonusLuck
        );`,
        [io.name, io.equipable, io.info, io.image, io.weapon, io.bonusHealth, io.bonusStrength, io.bonusMana, io.bonusArmor, io.bonusSpell, io.bonusHealing, io.bonusLuck]
    );

    db.close();
}

function newSpell(so) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `INSERT INTO spells VALUES (
            :spell_name,
            :description,
            :image,
            :type,
            :mana_cost,
            :damage,
            :bonus_roll
        );`,
        [so.name, so.info, so.image, so.type, so.mana, so.damage, so.bonus_roll]
    );

    db.close();
}

function equipItem(playerName, gameName, itemName, msg) {
    _checkIfPlayerHasItem(playerName, gameName, itemName, msg, hasItem => {
        if (hasItem) {
            getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
                // Get the to-be equiped item information.
                getItemInfo(itemName, msg, itemInfo => {
                    if (!itemInfo.equipable) {
                        return error.error("This item cannot be equiped.", null, msg);
                    }

                    let itemType = "";
                    (itemInfo.weapon) ? itemType = "weapon" : itemType = "clothing";

                    // Get the currently equiped item information and do the exchange.
                    getItemInfo(playerInfo[itemType], msg, equipedItemInfo => {
                        let db = new sqlite3.Database("dungeon.db", err => {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                        });

                        db.run(
                            `UPDATE player
                            SET armor = armor - ? + ?,
                                bonusSpell = bonusSpell - ? + ?,
                                bonusHealing = bonusHealing - ? + ?,
                                luck = luck - ? + ?,
                                maxHealth = maxHealth - ? + ?,
                                strength = strength - ? + ?,
                                maxMana = maxMana - ? + ?
                            WHERE username = ?
                            AND game_title = ?;`,
                            [equipedItemInfo.bonusArmor,
                                itemInfo.bonusArmor,
                                equipedItemInfo.bonusSpell,
                                itemInfo.bonusSpell,
                                equipedItemInfo.bonusHealing,
                                itemInfo.bonusHealing,
                                equipedItemInfo.luck,
                                itemInfo.bonusLuck,
                                equipedItemInfo.bonusHealth,
                                itemInfo.bonusHealth,
                                equipedItemInfo.bonusStrength,
                                itemInfo.bonusStrength,
                                equipedItemInfo.bonusMana,
                                itemInfo.bonusMana,
                                playerName,
                                gameName]
                        );

                        db.run(
                            `UPDATE player
                            SET ${itemType} = ?
                            WHERE username = ?
                            AND game_title = ?;`,
                            [itemName, playerName, gameName],
                            (err) => {
                                if (err) {
                                    console.log(err.message);
                                }

                                msg.react("✅");
                            }
                        );

                        db.close();
                    });
                });
            });
        }
    });
}

function giveMoney(playerName, gameObject, msg, quantity) {
    getBaiscPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        if (playerInfo) {
            let db = new sqlite3.Database("dungeon.db", err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
            });

            db.run(
                `UPDATE player
                SET money = money + ?
                WHERE username = ?
                AND game_title = ?;`,
                [quantity, playerName, gameObject.game_title],
                (err) => {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`Successfully paid \`${playerName}\`, \`${quantity}\` gold.`);
                    msg.guild.channels.cache.get(gameObject.playerChannel).send(`\`${playerName}\` just got \`${quantity}\` :coin:!`);
                }
            );

            db.close();
        }
    });
}

function spendMoney(playerName, gameObject, msg, quantity, callback) {
    getBaiscPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        if (playerInfo) {
            if (quantity > playerInfo.money) {
                return error.error(`${playerName} does not have enough money.`, `They are short ${quantity - playerInfo.money} :coin:.`, msg);
            }

            let db = new sqlite3.Database("dungeon.db", err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
            });

            db.run(
                `UPDATE player
                SET money = money - ?
                WHERE username = ?
                AND game_title = ?;`,
                [quantity, playerName, gameObject.game_title],
                (err) => {
                    if (callback) callback();
                }
            );

            db.close();
        }
    });
}

function _checkIfPlayerHasItem(playerName, gameName, itemName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM player_items
        WHERE username = ?
        AND item_name = ?
        AND game_title = ?;`,
        [playerName, itemName, gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            if (!row) {
                error.error("Item not found in your inventory.", "Try checking your spelling.", msg);
            }

            if (callback) callback(row);
        }
    );

    db.close();
}

function getFullPlayerInfo(playerName, gameName, msg, callback) {
    let playerInfo = {};

    getBaiscPlayerInfo(playerName, gameName, msg, info => {
        if (!info) {
            callback(null);
            return;
        }

        playerInfo = info;
        playerInfo.items = [];
        playerInfo.spells = [];

        getPlayerItems(playerName, gameName, items => {
            if (items) {
                playerInfo.items = items;
            }

            getPlayerSpells(playerName, gameName, spells => {
                if (spells) {
                    playerInfo.spells = spells;
                }

                callback(playerInfo);
            });
        });
    });
}

function getBaiscPlayerInfo(playerName, gameName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM player
        WHERE username = ?
        AND game_title = ?;`,
        [playerName, gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            if (!row) {
                error.error("Error obtaining player information.", "Try checking your spelling. Player names are case sensitive.", msg);
            }

            if (callback) callback(row);
        }
    );

    db.close();
}

function getPlayerItems(playerName, gameName, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.all(
        `SELECT item_name, quantity
        FROM player_items
        WHERE username = ?
        AND game_title = ?;`,
    [playerName, gameName],
    (err, rows) => {
        if (err) {
            console.log(err.message);
        }

        callback(rows);
    });

    db.close();
}

function getPlayerSpells(playerName, gameName, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.all(
        `SELECT spell_name
        FROM player_spells
        WHERE username = ?
        AND game_title = ?;`,
    [playerName, gameName],
    (err, rows) => {
        if (err) {
            console.log(err.message);
        }

        callback(rows);
    });

    db.close();
}

function getSpellInfo(spellName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM spells
        WHERE spell_name = ?;`,
        [spellName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            if (!row) {
                error.error("This spell does not exist.", `The host will need to \`!make spell ${spellName}\` to create the spell.`, msg);
                if (callback) callback(row);
            }
            if (callback) callback(row);
        }
    );

    db.close();
}

function getItemInfo(itemName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM items
        WHERE item_name = ?;`,
        [itemName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            if (!row) {
                error.error("This item does not exist.", `The host will need to \`!make item ${itemName}\` to create the item.`, msg);
                if (callback) callback(row);
            }
            if (callback) callback(row);
        }
    );

    db.close();
}

function giveItem(playerName, gameObject, itemName, quantity, msg) {
    if (!gameObject.players.includes(playerName)) {
        return error.error(`Could not find \`${playerName}\` in this game.`, "Player names are case sensitive unfortunately! Check if it looks right.", msg);
    } else if (itemName === "bare_fist" || itemName === "torn_clothing") {
        return error.error("This is not an item you can give.", "This is a default item given to all players upon creation.", msg);
    }

    getItemInfo(itemName, msg, itemInfo => {
        if (itemInfo) {
            getFullPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
                if (playerInfo) {
                    let occcupiedInventory = 0;
                    playerInfo.items.forEach(item => {
                        occcupiedInventory += item.quantity;
                    });

                    let remainingInventory = playerInfo.maxInventory - occcupiedInventory;

                    if (remainingInventory === 0) {
                        return error.error(`\`${playerName}\`'s inventory is completely full!`, "Unable to add any items.", msg);
                    } else if (quantity > remainingInventory) {
                        quantity = remainingInventory;
                        error.error(`\`${playerName}\` only has \`${remainingInventory}\` inventory spots left.`, "I've filled up their inventory but can't go beyond that.", msg);
                    }

                    let db = new sqlite3.Database("dungeon.db", err => {
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                    });

                    // If the player does not already have the item, then add it in.
                    db.run(
                        `INSERT OR IGNORE INTO player_items VALUES (
                        :item_name,
                        :username,
                        :quantity,
                        :game_title
                        );`,
                        [itemName, playerName, 0, gameObject.game_title]
                    );

                    // If the player has the item, increment the number.
                    db.run(
                        `UPDATE player_items
                        SET quantity = quantity + ?
                        WHERE username = ?
                        AND item_name = ?
                        AND game_title = ?;`,
                        [quantity, playerName, itemName, gameObject.game_title],
                        (err) => {
                            if (err) {
                                console.log(err.message);
                            }
                        }
                    );

                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`\`${quantity}\` \`${itemName}\` successfully given to \`${playerName}\``);
                    msg.guild.channels.cache.get(gameObject.playerChannel).send(`\`${playerName}\` has just received \`${quantity}\` new item(s)! \`!info\` to check it out.`);

                    db.close();
                }
            });
        }
    });
}

function giveSpell(playerName, gameObject, spellName, msg) {
    if (!gameObject.players.includes(playerName)) {
        return error.error(`Could not find \`${playerName}\` in this game.`, "Player names are case sensitive unfortunately! Check if it looks right.", msg);
    }

    getSpellInfo(spellName, msg, spellInfo => {
        if (spellInfo) {
            let db = new sqlite3.Database("dungeon.db", err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
            });

            // If the player does not already have the item, then add it in.
            db.get(`INSERT INTO player_spells VALUES (
                :spell_name,
                :username,
                :game_title
            );`,
            [spellName, playerName, gameObject.game_title],
            (err) => {
                if (err) {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`\`${playerName}\` already has this spell.`);
                } else {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`\`${spellName}\` successfully given to \`${playerName}\``);
                    msg.guild.channels.cache.get(gameObject.playerChannel).send(`\`${playerName}\` has just received a spell! \`!info\` to check it out.`);
                }
            });

            db.close();
        }
    });
}

function addPlayer(po) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `INSERT INTO player VALUES (
            :username,
            :class,
            :image,
            :money,
            :game_title,
            :isBot,
            :weapon,
            :clothing,
            :maxInventory,
            :armor,
            :bonusSpell,
            :bonusHealing,
            :luck,
            :health,
            :maxHealth,
            :strength,
            :mana,
            :maxMana
        );`,
        [po.username, po.class, po.image, po.money, po.game, po.isBot, po.weapon, po.clothing, po.maxInventory, po.armor, po.bonusSpell, po.bonusHealing, po.luck, po.health, po.maxHealth, po.strength, po.mana, po.maxMana]
    );

    po.items.forEach(itemName => {
        db.run(
            `INSERT INTO player_items VALUES (
                :item_name,
                :username,
                :quantity,
                :game_title
            );`,
            [itemName, po.username, 1, po.game]
        );
    });

    db.close();
}

function getGameInfo(gameName, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM game
        WHERE game_title = ?;`,
        [gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            let gameObject = row;

            if (gameObject) {
                gameObject.players = _stringToArray(gameObject.players);
                gameObject.declined = _stringToArray(gameObject.declined);
            }

            callback(gameObject);
        }
    );
    db.close();
}

function insertGame(gameObject) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    playerList = _arrayToString(gameObject.players);
    declinedList = _arrayToString(gameObject.declined);

    db.run(
        `INSERT INTO game VALUES (
            :game_title,
            :host,
            :players,
            :declined,
            :hostChannel,
            :playerChannel,
            :gameCategory,
            :archived,
            :activeGame
        );`,
        [gameObject.game_title, gameObject.host, playerList, declinedList, gameObject.hostChannel, gameObject.playerChannel, gameObject.gameCategory, gameObject.archived, gameObject.activeGame]
    );

    setActive.setActiveGameObject(gameObject);

    db.close();
}

function getActiveGame(callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM game
        WHERE activeGame = 1;`,
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            setActive.setActiveGameObject(row);

            if (callback) callback(row);
        }
    );

    db.close();
}

function deleteGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `DELETE FROM game
        WHERE game_title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    db.run(
        `DELETE FROM player
        WHERE game_title = ?`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    db.run(
        `DELETE FROM player_items
        WHERE game_title = ?`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    db.run(
        `DELETE FROM player_spells
        WHERE game_title = ?`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    db.run(
        `DELETE FROM player_journal
        WHERE game_title = ?`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    getActiveGame();

    db.close();
}

function archiveGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `UPDATE game
        SET archived = 1,
            activeGame = 0,
            hostChannel = NULL,
            playerChannel = NULL,
            gameCategory = NULL
        WHERE game_title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );

    db.close();

    getActiveGame();
}

function pauseGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `UPDATE game
        SET activeGame = 0
        WHERE game_title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }

            getActiveGame();
        }
    );

    db.close();
}

function playGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `UPDATE game
        SET activeGame = 1
        WHERE game_title = ?;`,
        [gameName],
        (err) => {
            getActiveGame();
        }
    );

    db.close();
}

function _arrayToString(inputArray) {
    stringArray = "";
    inputArray.forEach(element => {
        stringArray += element + "|";
    });
    return stringArray.slice(0, -1);
}

function _stringToArray(inputString) {
    if (inputString.length > 0) {
        return inputString.split("|");
    }
    return [];
}

exports.createDB = createDB;
exports.insertGame = insertGame;
exports.getGameInfo = getGameInfo;
exports.getActiveGame = getActiveGame;
exports.deleteGame = deleteGame;
exports.archiveGame = archiveGame;
exports.pauseGame = pauseGame;
exports.playGame = playGame;
exports.addPlayer = addPlayer;
exports.newItem = newItem;
exports.newSpell = newSpell;
exports.giveItem = giveItem;
exports.giveSpell = giveSpell;
exports.getSpellInfo = getSpellInfo;
exports.getItemInfo = getItemInfo;
exports.getBaiscPlayerInfo = getBaiscPlayerInfo;
exports.getFullPlayerInfo = getFullPlayerInfo;
exports.getPlayerItems = getPlayerItems;
exports.getPlayerSpells = getPlayerSpells;
exports.equipItem = equipItem;
