const sqlite3 = require("sqlite3").verbose(),
    setActive = require("../main"),
    dice = require("../util/dice"),
    display = require("../displayInfo/displayInfo"),
    error = require("../util/error");

function createDB() {
    let db = new sqlite3.Database("dungeon.db");

    db.run("PRAGMA foreign_keys = ON;");

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
            consumable INTEGER,
            description TEXT,
            image TEXT,
            damage_dice INTEGER,
            weapon INTEGER,
            bonusHealth INTEGER,
            bonusStrength INTEGER,
            bonusMana INTEGER,
            bonusArmor INTEGER,
            bonusSpell INTEGER,
            bonusHealing INTEGER,
            bonusLuck INTEGER,
            bonusInventory INTEGER,
            bonusMoney INTEGER,
            PRIMARY KEY (item_name)
        );`, (err) => {
            db.run(`INSERT OR IGNORE INTO items VALUES (
                :item_name,
                :equipable,
                :consumable,
                :description,
                :image,
                :damage_dice,
                :weapon,
                :bonusHealth,
                :bonusStrength,
                :bonusMana,
                :bonusArmor,
                :bonusSpell,
                :bonusHealing,
                :bonusLuck,
                :bonusInventory,
                :bonusMoney
            );`,
            ["bare_fist",1,0,"Just your bare fists.","https://i.imgur.com/trX6GKf.png",5,1,0,0,0,0,0,0,0,0,0]);

            db.run(`INSERT OR IGNORE INTO items VALUES (
                :item_name,
                :equipable,
                :consumable,
                :description,
                :image,
                :damage_dice,
                :weapon,
                :bonusHealth,
                :bonusStrength,
                :bonusMana,
                :bonusArmor,
                :bonusSpell,
                :bonusHealing,
                :bonusLuck,
                :bonusInventory,
                :bonusMoney
            );`,
            ["torn_clothing",1,0,"The bare necessities.","https://imgur.com/9YvRj1P.png",0,0,0,0,0,0,0,0,0,0,0]);
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
            healing INTEGER,
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

    db.run(
        `CREATE TABLE IF NOT EXISTS shops (
            shop_name TEXT NOT NULL,
            stock TEXT NOT NULL,
            game_title TEXT NOT NULL,
            PRIMARY KEY (shop_name, game_title),
            FOREIGN KEY (game_title) REFERENCES game ON DELETE CASCADE
        );`
    );

    db.close();
}

function newItem(io, callback) {
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
            :consumable,
            :description,
            :image,
            :damage_dice,
            :weapon,
            :bonusHealth,
            :bonusStrength,
            :bonusMana,
            :bonusArmor,
            :bonusSpell,
            :bonusHealing,
            :bonusLuck,
            :bonusInventory,
            :bonusMoney
        );`,
        [io.name, io.equipable, io.consumable, io.description, io.image, io.damage_dice, io.weapon, io.bonusHealth, io.bonusStrength, io.bonusMana, io.bonusArmor, io.bonusSpell, io.bonusHealing, io.bonusLuck, io.bonusInventory, io.bonusMoney],
        (err) => {
            if (err) {
                console.log("Database Error: " + err);
            } else if (callback) callback();
        }
    );

    db.close();
}

function newSpell(so, callback) {
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
            :healing,
            :bonus_roll
        );`,
        [so.name, so.description, so.image, so.type, so.mana_cost, so.damage, so.healing, so.bonus_roll],
        (err) => {
            if (err) {
                console.log("Database Error: " + err);
            } else if (callback) callback();
        }
    );

    db.close();
}

function deleteItem(itemName, msg) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `DELETE FROM items
        WHERE item_name = ?;`,
        [itemName]
    );

    db.run(
        `DELETE FROM player_items
        WHERE item_name = ?;`,
        [itemName]
    );

    msg.react("✅");

    db.close();
}

function deleteSpell(spellName, msg) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `DELETE FROM spells
        WHERE spell_name = ?;`,
        [spellName]
    );

    db.run(
        `DELETE FROM player_spells
        WHERE spell_name = ?;`,
        [spellName]
    );

    msg.react("✅");

    db.close();
}

function createShop(shopName, stock, gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `INSERT INTO shops VALUES (
            :shop_name,
            :stock,
            :game_title
        );`,
        [shopName, stock, gameName]
    );

    db.close();
}

function deleteShop(shopName, gameName, msg) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `DELETE FROM shops
        WHERE shop_name = ?
        AND game_title = ?;`,
        [shopName, gameName]
    );

    msg.react("✅");

    db.close();
}

function getShop(shopName, gameName, alwaysReturn, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT *
        FROM shops
        WHERE shop_name = ?
        AND game_title = ?;`,
        [shopName, gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            } else if (callback && (row || alwaysReturn)) {
                callback(row);
            } else if (!row && !alwaysReturn) {
                error.error(`\`${shopName}\` does not exist`, `Create a shop with:\n\`!shop -${shopName} -<item name> -<$> -<item name> -<$>...\`\nThis allows for up to 9 items to be sold in a store.`, msg);
            }
        }
    );

    db.close();
}

function castSpell(targetName, playerName, gameName, spellName, msg) {
    _checkIfPlayerHasSpell(playerName, gameName, spellName, msg, hasSpell => {
        getSpellInfo(spellName, false, msg, spellInfo => {
            getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
                getBaiscPlayerInfo(targetName, gameName, msg, targetInfo => {
                    if (playerInfo.mana < spellInfo.mana_cost) {
                        return error.error("Not enough mana.", `Need \`${spellInfo.mana_cost - playerInfo.mana}\` more mana.`, msg);
                    }

                    if (spellInfo.type === "attack") {
                        let roll = 0;
                        if (spellInfo.bonus_roll) roll = dice.roll(spellInfo.bonus_roll);

                        let totalDamage = spellInfo.damage + roll - targetInfo.armor + playerInfo.bonusSpell;
                        if (totalDamage < 0) totalDamage = 0;

                        damagePlayer(targetName, gameName, "health", totalDamage, msg);
                        display.castInfo(playerInfo, spellInfo, totalDamage, roll, targetInfo.armor, targetInfo.username, msg);
                    } else if (spellInfo.type === "healing") {
                        let roll = 0;
                        if (spellInfo.bonus_roll) roll = dice.roll(spellInfo.bonus_roll);

                        let totalHealing = spellInfo.healing + roll + playerInfo.bonusHealing;
                        healPlayer(targetName, gameName, "health", totalHealing, msg);
                        display.castInfo(playerInfo, spellInfo, totalHealing, roll, null, targetInfo.username, msg);
                    } else {
                        display.castInfo(playerInfo, spellInfo, null, null, null, null, msg);
                    }

                    damagePlayer(playerName, gameName, "mana", spellInfo.mana_cost, msg);
                });
            });
        });
    });
}

function damagePlayer(playerName, gameName, stat, amount, msg, callback) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        let db = new sqlite3.Database("dungeon.db", err => {
            if (err) {
                console.log(err.message);
                return;
            }
        });

        switch (stat) {
            case "health":
                if (playerInfo.health - amount <= 0) {
                    error.error(`${playerName} has been killed!`, null, msg);
                    amount = playerInfo.health;
                }
                break;
            case "mana":
                if (playerInfo.mana - amount <= 0)
                    amount = playerInfo.mana;
                break;
            case "strength":
                if (playerInfo.strength - amount <= 0)
                    amount = playerInfo.strength;
                break;
        }

        db.run(
            `UPDATE player
            SET ${stat} = ${stat} - ?
            WHERE username = ?
            AND game_title = ?;`,
            [amount, playerName, gameName],
            (err) => {
                if (callback) callback(amount);
            }
        );

        db.close();
    });
}

function healPlayer(playerName, gameName, stat, amount, msg, callback) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        let db = new sqlite3.Database("dungeon.db", err => {
            if (err) {
                console.log(err.message);
                return;
            }
        });

        switch(stat) {
            case "health":
                if (playerInfo.health + amount > playerInfo.maxHealth)
                    amount = playerInfo.maxHealth - playerInfo.health;
                break;
            case "mana":
                if (playerInfo.mana + amount > playerInfo.maxMana)
                    amount = playerInfo.maxMana - playerInfo.mana;
                break;
        }

        db.run(
            `UPDATE player
            SET ${stat} = ${stat} + ?
            WHERE username = ?
            AND game_title = ?;`,
            [amount, playerName, gameName],
            (err) => {
                if (callback) callback(amount);
            }
        );

        db.close();
    });
}

function setMaxStat(playerName, gameName, stat, amount, msg, callback) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        let db = new sqlite3.Database("dungeon.db", err => {
            if (err) {
                console.log(err.message);
                return;
            }
        });

        switch(stat) {
            case "maxHealth":
                if (amount < playerInfo.health)
                    playerInfo.health = amount
                break;
            case "maxMana":
                if (amount < playerInfo.mana)
                    playerInfo.mana = amount;
                break;
        }

        db.run(
            `UPDATE player
            SET ${stat} = ?,
                health = ?,
                mana = ?
            WHERE username = ?
            AND game_title = ?;`,
            [amount, playerInfo.health, playerInfo.mana, playerName, gameName],
            (err) => {
                if (callback) callback();
            }
        );

        db.close();
    });
}

function uploadImage(link, playerName, gameName, msg) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        let db = new sqlite3.Database("dungeon.db", err => {
            if (err) {
                console.log(err.message);
                return;
            }
        });

        db.run(
            `UPDATE player
            SET image = ?
            WHERE username = ?
            AND game_title = ?;`,
            [link, playerName, gameName],
            (err) => {
                msg.react("✅");
            }
        );

        db.close();
    });
}

function addJournalEntry(entryName, description, playerName, gameName, msg) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `INSERT INTO player_journal VALUES (
            :entry_name,
            :username,
            :description,
            :game_title
        );`,
        [entryName, playerName, description, gameName],
        (err) => {
            if (err) {
                error.error("There is already an entry with that name.", "I send you a DM.", msg);
                msg.delete();
                msg.author.send(`I removed the note from the server to try to keep it private. But it failed to be written down. This is what you wrote: \`!add-note -${entryName} -${description}\``)
            } else {
                msg.delete();
                msg.channel.send("Note added. Do `!journal` to take a look.");
            }
        }
    );

    db.close();
}

function deleteJournalEntry(entryName, playerName, gameName, msg) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `DELETE FROM player_journal
        WHERE entry_name = ?
        AND username = ?
        AND game_title = ?;`,
        [entryName, playerName, gameName]
    );

    msg.react("✅");

    db.close();
}

function getJournalEntries(playerName, gameName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.all(
        `SELECT entry_name, description
        FROM player_journal
        WHERE username = ?
        AND game_title = ?;`,
        [playerName, gameName],
        (err, rows) => {
            if (!rows) {
                callback([]);
            } else {
                callback(rows);
            }
        }
    );

    db.close();
}

function bleedPlayer(healthDecrease, manaIncrease, playerName, gameName, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.run(
        `UPDATE player
        SET health = health - ?,
            mana = mana + ?
        WHERE username = ?
        AND game_title = ?;`,
        [healthDecrease, manaIncrease, playerName, gameName],
        (err) => {
            if (callback) callback();
        }
    );

    db.close();
}

function useItem(itemName, playerName, gameName, msg) {
    _checkIfPlayerHasItem(playerName, gameName, itemName, msg, itemInfo => {
        getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
            itemInfo.quantity -= 1;
            let deleteItem = (itemInfo.quantity <= 0) ? true : false;
            getItemInfo(itemName, false, msg, fullItemInfo => {
                if (!fullItemInfo.consumable) {
                    return error.error("This item cannot be consumed.", null, msg);
                }

                fullItemInfo.bonusHealth += playerInfo.bonusHealing;

                if (fullItemInfo.bonusHealth + playerInfo.health > playerInfo.maxHealth) {
                    fullItemInfo.bonusHealth = playerInfo.maxHealth - playerInfo.health;
                }
                if (fullItemInfo.bonusMana + playerInfo.mana > playerInfo.maxMana) {
                    fullItemInfo.bonusMana = playerInfo.maxMana - playerInfo.mana;
                }

                let db = new sqlite3.Database("dungeon.db", err => {
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                });

                db.run(
                    `UPDATE player_items
                    SET quantity = ?
                    WHERE item_name = ?
                    AND username = ?
                    AND game_title = ?;`,
                    [itemInfo.quantity, itemName, playerName, gameName]
                );

                if (deleteItem) {
                    db.run(
                        `DELETE FROM player_items
                        WHERE item_name = ?
                        AND username = ?
                        AND game_title = ?;`,
                        [itemName, playerName, gameName]
                    );
                }

                db.run(
                    `UPDATE player
                    SET health = health + ?,
                        mana = mana + ?,
                        strength = strength + ?,
                        armor = armor + ?,
                        bonusSpell = bonusSpell + ?,
                        bonusHealing = bonusHealing + ?,
                        luck = luck + ?,
                        money = money + ?,
                        maxInventory = maxInventory + ?
                    WHERE username = ?
                    AND game_title = ?;`,
                    [fullItemInfo.bonusHealth,
                        fullItemInfo.bonusMana,
                        fullItemInfo.bonusStrength,
                        fullItemInfo.bonusArmor,
                        fullItemInfo.bonusSpell,
                        fullItemInfo.bonusHealing,
                        fullItemInfo.bonusLuck,
                        fullItemInfo.bonusMoney,
                        fullItemInfo.bonusInventory,
                        playerName,
                        gameName],
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

function equipItem(playerName, gameName, itemName, msg) {
    _checkIfPlayerHasItem(playerName, gameName, itemName, msg, hasItem => {
        getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
            // Get the to-be equiped item information.
            getItemInfo(itemName, false, msg, itemInfo => {
                if (!itemInfo.equipable) {
                    return error.error("This item cannot be equiped.", null, msg);
                }

                let itemType = "";
                (itemInfo.weapon) ? itemType = "weapon" : itemType = "clothing";

                // Get the currently equiped item information and do the exchange.
                getItemInfo(playerInfo[itemType], false, msg, equipedItemInfo => {
                    let simulatedMaxHp = playerInfo.maxHealth - equipedItemInfo.bonusHealth + itemInfo.bonusHealth;
                    let simulatedMaxMana = playerInfo.maxMana - equipedItemInfo.maxMana + itemInfo.maxMana;

                    if (playerInfo.health > simulatedMaxHp) playerInfo.health = simulatedMaxHp;
                    if (playerInfo.mana > simulatedMaxMana) playerInfo.mana = simulatedMaxMana;

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
                            health = ?,
                            strength = strength - ? + ?,
                            maxMana = maxMana - ? + ?,
                            mana = ?
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
                            playerInfo.health,
                            equipedItemInfo.bonusStrength,
                            itemInfo.bonusStrength,
                            equipedItemInfo.bonusMana,
                            itemInfo.bonusMana,
                            playerInfo.mana,
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
    });
}

function dropItem(playerName, gameName, itemName, quantity=1, msg, callback) {
    if (itemName === "torn_clothing" || itemName === "bare_fist") {
        return error.error("This is a default item given to all players.", "It cannot be removed from your inventory.", msg);
    }

    _checkIfPlayerHasItem(playerName, gameName, itemName, msg, invItem => {
        getFullPlayerInfo(playerName, gameName, msg, playerInfo => {
            if (playerInfo.weapon === itemName && quantity >= invItem.quantity) {
                equipItem(playerName, gameName, "bare_fist", msg);
                msg.channel.send(`\`${itemName}\` has been unequiped.`);
            } else if (playerInfo.clothing === itemName && quantity >= invItem.quantity) {
                equipItem(playerName, gameName, "torn_clothing", msg);
                msg.channel.send(`\`${itemName}\` has been unequiped.`);
            }

            let deleteAll = false;
            if (quantity >= invItem.quantity) {
                quantity = invItem.quantity
                deleteAll = true;
            }

            let db = new sqlite3.Database("dungeon.db", err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
            });

            if (deleteAll) {
                db.run(
                    `DELETE FROM player_items
                    WHERE item_name = ?
                    AND username = ?
                    AND game_title = ?;`,
                    [itemName, playerName, gameName]
                );
            } else {
                db.run(
                    `UPDATE player_items
                    SET quantity = quantity - ?
                    WHERE item_name = ?
                    AND username = ?
                    AND game_title = ?;`,
                    [quantity, itemName, playerName, gameName]
                );
            }

            db.close();

            if (callback) callback(quantity);
        });
    });
}

function transferItem(senderName, recieverName, gameObject, itemName, quantity=1, msg, callback) {
    getFullPlayerInfo(recieverName, gameObject.game_title, msg, recieverInfo => {
        let occupiedInventory = 0;
        recieverInfo.items.forEach(item => {
            occupiedInventory += item.quantity;
        });

        if (recieverInfo.maxInventory <= occupiedInventory) {
            return error.error(`\`${recieverName}\` has maxed out their inventory.`, `\`${recieverName}\` should \`!drop <item name>\` or \`!use <item name>\` to clean it up a bit.`, msg);
        }

        _checkIfPlayerHasItem(senderName, gameObject.game_title, itemName, msg, itemInfo => {
            if (quantity > itemInfo.quantity) quantity = itemInfo.quantity;
            if (quantity > (recieverInfo.maxInventory - occupiedInventory)) quantity = recieverInfo.maxInventory - occupiedInventory;

            giveItem(recieverName, gameObject, itemName, quantity, msg, successful => {
                dropItem(senderName, gameObject.game_title, itemName, quantity, msg, status => {
                    callback(status);
                });
            });
        });
    });
}

function payPlayer(receiver, amount, playerName, gameName, msg) {
    spendMoney(playerName, gameName, amount, msg, () => {
        giveMoney(receiver, gameName, amount, msg);
    });
}

function spendMoney(playerName, gameName, quantity, msg, callback) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
        if (quantity > playerInfo.money) {
            return error.error(`${playerName} does not enough money.`, `Short ${quantity - playerInfo.money} :coin:.`, msg);
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
            [quantity, playerName, gameName],
            (err) => {
                if (callback) callback();
            }
        );

        db.close();
    });
}

function buyItem(playerName, gameObject, itemName, price, msg) {
    // Confirm that the player is a part of the game.
    getFullPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        let occupiedInventory = 0;
        playerInfo.items.forEach(itemObject => {
            occupiedInventory = itemObject.quantity;
        });

        if (occupiedInventory >= playerInfo.maxInventory) {
            return error.error(`${playerName} does not have enough inventory space.`, null, msg);
        }

        spendMoney(playerName, gameObject.game_title, price, msg, () => {
            giveItem(playerName, gameObject, itemName, 1, msg, success => {
                msg.channel.send(`${playerName} bought a ${itemName}`);
            });
        });
    });
}

function giveMoney(playerName, gameName, quantity, msg) {
    getBaiscPlayerInfo(playerName, gameName, msg, playerInfo => {
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
            [quantity, playerName, gameName],
            (err) => {
                msg.react("✅");
            }
        );

        db.close();
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
        `SELECT item_name, quantity
        FROM player_items
        WHERE username = ?
        AND item_name = ?
        AND game_title = ?;`,
        [playerName, itemName, gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            } else if (callback && row) {
                callback(row);
            } else if (!row) {
                error.error(`\`${itemName}\` not found in inventory.`, "Try checking your spelling.", msg);
            }
        }
    );

    db.close();
}

function _checkIfPlayerHasSpell(playerName, gameName, spellName, msg, callback) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `SELECT spell_name
        FROM player_spells
        WHERE username = ?
        AND spell_name = ?
        AND game_title = ?;`,
        [playerName, spellName, gameName],
        (err, row) => {
            if (err) {
                console.log(err.message);
            } else if (callback && row) {
                callback(row);
            } else if (!row) {
                error.error(`\`${spellName}\` not found in player's list of known spells.`, "Try checking your spelling.", msg);
            }
        }
    );

    db.close();
}

function getFullPlayerInfo(playerName, gameName, msg, callback) {
    getBaiscPlayerInfo(playerName, gameName, msg, info => {
        getPlayerItems(playerName, gameName, items => {
            getPlayerSpells(playerName, gameName, spells => {
                let playerInfo = info;
                (items) ? playerInfo.items = items : playerInfo.items = [];
                (spells) ? playerInfo.spells = spells : playerInfo.spells = [];
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
            } else if (callback && row) {
                callback(row);
            } else if (!row) {
                error.error(`Could not find \`${playerName}\` in this game.`, "Player names are case sensitive unfortunately! Check if it looks right.", msg);
            }
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

        if (callback) callback(rows);
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

        if (callback) callback(rows);
    });

    db.close();
}

function getSpellInfo(spellName, alwaysReturn, msg, callback) {
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
            } else if (callback && (row || alwaysReturn)) {
                callback(row);
            } else if (!row && !alwaysReturn) {
                error.error("This spell does not exist.", `The host will need to \`!make spell ${spellName}\` to create the spell.`, msg);
            }
        }
    );

    db.close();
}

function getItemInfo(itemName, alwaysReturn, msg, callback) {
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
            } else if (callback && (row || alwaysReturn)) {
                callback(row);
            } else if (!row && !alwaysReturn) {
                error.error("This item does not exist.", `The host will need to \`!make item ${itemName}\` to create the item.`, msg);
            }
        }
    );

    db.close();
}

function giveItem(playerName, gameObject, itemName, quantity=1, msg, callback) {
    if (itemName === "bare_fist" || itemName === "torn_clothing") {
        return error.error("This is not an item you can give.", "This is a default item given to all players upon creation.", msg);
    }

    getItemInfo(itemName, false, msg, itemInfo => {
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
                        } else if (callback) {
                            callback(quantity);
                        }
                    }
                );

                db.close();
            }
        });
    });
}

function giveSpell(playerName, gameObject, spellName, msg) {
    getBaiscPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        getSpellInfo(spellName, false, msg, spellInfo => {
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
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`❌ \`${playerName}\` already has this spell.`);
                } else {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`✅ \`${spellName}\` successfully given to \`${playerName}\``);
                    if (!playerInfo.isBot) msg.guild.channels.cache.get(gameObject.playerChannel).send(`\`${playerName}\` has just received a spell! \`!info\` to check it out.`);
                }
            });

            db.close();
        });
    });
}

function takeSpell(playerName, gameObject, spellName, msg) {
    getBaiscPlayerInfo(playerName, gameObject.game_title, msg, playerInfo => {
        _checkIfPlayerHasSpell(playerName, gameObject.game_title, spellName, msg, playerSpell => {
            let db = new sqlite3.Database("dungeon.db", err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
            });

            db.get(
                `DELETE FROM player_spells
                WHERE spell_name = ?
                AND username = ?
                AND game_title = ?;`,
            [spellName, playerName, gameObject.game_title],
            (err) => {
                if (err) {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`❌ Could not remove the spell.`);
                } else {
                    msg.guild.channels.cache.get(gameObject.hostChannel).send(`✅ \`${spellName}\` successfully taken from \`${playerName}\``);
                    if (!playerInfo.isBot) msg.guild.channels.cache.get(gameObject.playerChannel).send(`\`${playerName}\` just lost a spell!`);
                }
            });

            db.close();
        });
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

            if (row) {
                row.players = _stringToArray(row.players);
                row.declined = _stringToArray(row.declined);
            }

            callback(row);
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

            if (row) {
                row.players = _stringToArray(row.players);
                row.declined = _stringToArray(row.declined);
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

    db.run(
        `DELETE FROM shops
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
exports.dropItem = dropItem;
exports.transferItem = transferItem;
exports.bleedPlayer = bleedPlayer;
exports.useItem = useItem;
exports.uploadImage =uploadImage;
exports.addJournalEntry = addJournalEntry;
exports.deleteJournalEntry = deleteJournalEntry;
exports.getJournalEntries = getJournalEntries;
exports.payPlayer = payPlayer;
exports.giveMoney = giveMoney;
exports.spendMoney = spendMoney;
exports.castSpell = castSpell;
exports.deleteItem = deleteItem;
exports.deleteSpell = deleteSpell;
exports.createShop = createShop;
exports.deleteShop = deleteShop;
exports.getShop = getShop;
exports.buyItem = buyItem;
exports.damagePlayer = damagePlayer;
exports.healPlayer = healPlayer;
exports.setMaxStat = setMaxStat;
exports.takeSpell = takeSpell;
