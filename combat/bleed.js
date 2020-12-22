const fs = require('fs'),
    error = require('../util/error');

function bleed(bleedNum, msg) {
    if (isNaN(bleedNum)) {
        return error.error('Your input needs to be a number.', msg);
    }

    fs.readFile(`playerInfo/${msg.member.nickname}.json`, 'utf8', function (err, jsonString) {
        if (err) {
            return error.error('Failed to read player info.', msg);
        }

        let playerInfo = JSON.parse(jsonString),
            trueBleed = Number(bleedNum);

        if (playerInfo.mana === playerInfo.maxMana) {
            return error.error('You already have max mana.', msg);
        } else if (Number(playerInfo.maxMana) - Number(playerInfo.mana) < bleedNum) {
            msg.channel.send('Hey I noticed that you would waste health if you tried to bleed that much. I reduced the amount you bleed by so that it caps you off instead.');
            trueBleed = Number(playerInfo.maxMana) - Number(playerInfo.mana);
        }

        playerInfo.health = Number(playerInfo.health) - 3 * trueBleed;
        if (Number(playerInfo.health) <= 0) {
            return error.error('You cannot kill yourself trying to gain mana.', msg);
        }
        playerInfo.mana = Number(playerInfo.mana) + trueBleed;

        writeInfo.writeInfo(playerInfo, msg, function () {
            msg.channel.send(msg.member.nickname + ' has lost `' + 3 * trueBleed + '` HP and gained `' + trueBleed + '` MP.');
        });
    });
}

exports.bleed = bleed;
