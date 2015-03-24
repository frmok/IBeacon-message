module.exports = {
  send: function(pollID, tokens) {
    var apn = require('apn');
    var root = process.cwd();
    var options = {
      cert: root + '/mallcert.pem',
      key: root + '/mallkey.pem',
      passphrase: '123456',
      production: false
    };
    var apnConnection = new apn.Connection(options);
    var note = new apn.Notification();
    note.sound = "ping.aiff";
    note.keepPoll = pollID;
    note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
    apnConnection.pushNotification(note, tokens);
  }
}