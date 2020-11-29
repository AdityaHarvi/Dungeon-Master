const getInfo = require('../gameInfo/getInfo'),
    error = require('./error'),
    writeInfo = require('../gameInfo/writeInfo');

function checkURL(imageURL) {
    let pattern = /^https:\/\/i.imgur.com\/\w{7}.(png|gif)$/;
    return pattern.test(imageURL);
}

function uploadImage(imageURL, playerName, msg) {
    let validURL = checkURL(imageURL);

    if (!validURL) return error.error('You need to submit a `Direct Link` from imgur. No other URL will be acceptable.', msg);

    getInfo.getPlayerInfo(playerName, msg, (playerInfo) => {
        playerInfo.image = imageURL;
        writeInfo.writeInfo(playerInfo, msg, () => {
            msg.channel.send('Profile picture has been successfully uploaded.');
        });
    });
}

exports.uploadImage = uploadImage;
