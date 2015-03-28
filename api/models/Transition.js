/**
 * Transition.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'transition',
  attributes: {
    identifier: {
      type: 'string'
    },
    location_id: {
      model: 'location'
    },
    next_location: {
      model: 'location'
    },
    send: function(pollID) {
      Push.send(pollID);
    },
  },
  /**
  LIFECYCLE CALLBACK
  **/
  beforeCreate: function(transition, cb) {
    Transition
      .update({
        identifier: transition.identifier,
        next_location: null
      }, {
        next_location: transition.location_id
      })
      .exec(function(err, transition) {
        cb();
      });
  },
  afterCreate: function(transition, cb) {
    var subscribers = sails.sockets.subscribers('transition');
    sails.sockets.emit(subscribers, 'transition_created', {
      transition: transition
    });
    cb();
  },
  afterUpdate: function(transition, cb) {
    var subscribers = sails.sockets.subscribers('transition');
    sails.sockets.emit(subscribers, 'transition_updated', {
      transition: transition
    });
    cb();
  },
};