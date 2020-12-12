const sqlite3 = require("sqlite3").verbose();

function createDB() {
    let db = new sqlite3.Database("dungeon.db");

    db.get("PRAGMA foreign_keys = ON");

    db.run(
        `CREATE TABLE IF NOT EXISTS game (
            title TEXT NOT NULL PRIMARY KEY,
            host TEXT,
            players TEXT,
            declined TEXT,
            hostChannel TEXT,
            playerChannel TEXT,
            gameCategory TEXT,
            archived INTEGER,
            activeGame INTEGER
        );`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS player (
            username TEXT NOT NULL,
            class TEXT NOT NULL,
            title TEXT,
            spells TEXT,
            items TEXT,
            weapon TEXT,
            clothing TEXT,
            diceSize INTEGER,
            journal TEXT,
            maxInventory INTEGER,
            armor INTEGER,
            bonusSpell INTEGER,
            bonusHealing INTEGER,
            luck INTEGER,
            health INTEGER,
            strength INTEGER,
            mana INTEGER,
            PRIMARY KEY (username, title),
            FOREIGN KEY (title) REFERENCES game ON DELETE CASCADE
        );`
    );

    db.close();
}

function addPlayer(po) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    let spells = _arrayToString(po.spells);
    let items = _arrayToString(po.items);

    db.run(
        `INSERT INTO player VALUES (
            :username,
            :class,
            :title,
            :spells,
            :items,
            :weapon,
            :clothing,
            :diceSize,
            :journal,
            :maxInventory,
            :armor,
            :bonusSpell,
            :bonusHealing,
            :luck,
            :health,
            :strength,
            :mana
        );`,
        [po.username, po.class, spells, items, po.weapon, po.clothing, po.diceSize, po.journal, po.maxInventory, po.armor, po.bonusSpell, po.bonusHealing, po.luck, po.health, po.strength, po.mana]
    )

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
        WHERE title = ?;`,
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
            :title,
            :host,
            :players,
            :declined,
            :hostChannel,
            :playerChannel,
            :gameCategory,
            :archived,
            :activeGame
        );`,
        [gameObject.title, gameObject.host, playerList, declinedList, gameObject.hostChannel, gameObject.playerChannel, gameObject.gameCategory, gameObject.archived, gameObject.activeGame]
    )

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
        WHERE activeGame = 1`,
        (err, row) => {
            if (err) {
                console.log(err.message);
            }

            callback(row);
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

    db.get(
        `DELETE FROM game
        WHERE title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );
    db.close();
}

function archiveGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `UPDATE game
        SET archived = 1,
            activeGame = 0,
            hostChannel = NULL,
            playerChannel = NULL,
            gameCategory = NULL
        WHERE title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );
    db.close();
}

function pauseGame(gameName) {
    let db = new sqlite3.Database("dungeon.db", err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

    db.get(
        `UPDATE game
        SET activeGame = 0
        WHERE title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
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

    db.get(
        `UPDATE game
        SET activeGame = 1
        WHERE title = ?;`,
        [gameName],
        (err) => {
            if (err) {
                console.log(err.message);
            }
        }
    );
    db.close();
}

function _journalToString(journal) {
    let stringJournal = "";
    journal.forEach(object => {
        stringJournal += object.name + ",";
        stringJournal += object.message + "|";
    });
    return stringJournal.slice(0, -1);
}

function _arrayToString(inputArray) {
    stringArray = "";
    inputArray.forEach(element => {
        stringArray += element + ",";
    });
    return stringArray.slice(0, -1);
}

function _stringToArray(inputString) {
    if (inputString.length > 0) {
        return inputString.split(",");
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
