/**
 * Randomly generates a number between 1 and a given size (default 20).
 * @param {integer} diceSize The maximum size of the dice. This is an optional field.
 */
function diceRoll(diceSize) {
    // Keep rolling until a valid value is obtained.
    let roll = Math.round(Math.random() * diceSize);
    while (roll === 0) {
        roll = Math.round(Math.random() * diceSize);
    }

    return roll;
}

exports.diceRoll = diceRoll;
