const error = require('./error');

function checkJournal(journalArray, noteName) {
    for (var i = 0; i < journalArray.length; i++) {
        if (journalArray[i].name === noteName) return true;
    }
    return false;
}

function addNote(playerName, noteName, noteMessage, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        if (playerInfo.journal.length >= 25) return error.error(`Your journal is only so big. You used all 25 slots. Scratch some out and write over it with \`!remove-note <note-name>\`.`, msg);
        
        let journalEntry = {
            name: noteName,
            message: noteMessage
        }

        if (!noteName) return error.error('You need to have a proper entry-name. `!add-note <name> <message>`', msg);
        if (checkJournal(playerInfo.journal, noteName)) return error.error(`An entry already exists with this name. Do \`!remove-note ${noteName}\` then re-submit this command.`, msg);

        playerInfo.journal.push(journalEntry);
        writeInfo.writeInfo(playerInfo, msg, () => {
            msg.channel.send('New note has been added to your journal! Do `!journal` to take a look.');
        });
    });
}

function adjustJournalArray(noteName, journalArray) {
    let adjustedArray = [],
    flag = true;

    for (var i = 0; i < journalArray.length; i++) {
        if (journalArray[i].name === noteName && flag) {
            flag = false;
        } else {
            adjustedArray.push(journalArray[i]);
        }
    }

    return adjustedArray;
}

function removeNote(playerName, noteName, msg) {
    // Read player information.
    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        if (!checkJournal(playerInfo.journal, noteName)) return error.error('You do not have an entry with that title.', msg);
        
        playerInfo.journal = adjustJournalArray(noteName, playerInfo.journal);

        writeInfo.writeInfo(playerInfo, msg, () => {
            msg.channel.send('Journal has been updated!');
        });
    });
}

exports.addNote = addNote;
exports.removeNote = removeNote;
