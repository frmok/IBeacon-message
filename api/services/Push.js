var apn = require('apn');
var root = process.cwd();
var options = {
  cert: root + '/mallcert.pem',
  key: root + '/mallkey.pem',
  passphrase: '123456',
  production: false
};
module.exports = {

  /**
   * This method returns the data of a location
   *
   * @method sendQuestion
   * @param {Integer} pollID - The ID of KEEP Poll question
   * @param {Array} tokens - An array of iOS device tokens
   */
  sendQuestion: function(pollID, tokens) {
    var note = new apn.Notification();
    note.sound = "ping.aiff";
    note.keepPoll = pollID;
    note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
    this.iOSPush(note, tokens);
  },

  /**
   * This method returns the data of a location
   *
   * @method getByBeacon
   * @param {String} message - The message content
   * @param {Array} tokens - An array of iOS device tokens
   */
  sendMessage: function(message, tokens) {
    var note = new apn.Notification();
    note.sound = "ping.aiff";
    note.alert = message;
    this.iOSPush(note, tokens);
  },

  /**
   * This method returns the data of a location
   *
   * @method iOSPush
   * @param {Object} notification - The notification payload, which should obey the format of Apple Push notification format
   * @param {Array} tokens - An array of iOS device tokens
   */
  iOSPush: function(notification, tokens) {
    var apnConnection = new apn.Connection(options);
    apnConnection.pushNotification(notification, tokens);
  }

}