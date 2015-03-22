module.exports = {
    send: function (pollID){
        var apn = require('apn');
        var root = process.cwd();
        var options = {
            cert: root + '/mallcert.pem',
            key:  root + '/mallkey.pem',
            passphrase: '123456',
            production: false
        };
        var apnConnection = new apn.Connection(options);
        var tokens = ["bbe8a5c7d5418a6a25110dc7b159075d0f3c4ba3a13040317e9defa740231ce4"];
        var note = new apn.Notification();
        note.sound = "ping.aiff";
        note.keepPoll = pollID;
        note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
        apnConnection.pushNotification(note, tokens);
    }
}