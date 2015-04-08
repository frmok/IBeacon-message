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
  sendMessage: function(msgOptions, tokens) {
    var note = new apn.Notification();
    var record = msgOptions.recordId;
    note.sound = "ping.aiff";
    note.payload = {
      'msgType': msgOptions.msgType,
      'msgContent': msgOptions.msgContent,
      'recordId': msgOptions.recordId,
    };
    note.alert = msgOptions.msgText;
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