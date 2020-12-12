/**
 * Randomly generates a number between 1 and a given size (default 20).
 * @param {integer} diceSize The maximum size of the dice. This is an optional field.
 */
function diceRoll(diceSize=20) {
    return 1 + Math.floor(Math.random() * diceSize)
}

exports.diceRoll = diceRoll;
