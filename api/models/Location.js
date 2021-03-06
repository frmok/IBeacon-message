/**
 * Location.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'location',
  attributes: {
    name: {
      type: 'string'
    },
    disabled: {
      type: 'integer'
    },
    distance: {
      type: 'float'
    },
    msgType: {
      type: 'integer'
    },
    msgContent: {
      type: 'string'
    },
    msgText: {
      type: 'string'
    },
    beacons: {
      collection: 'beacon',
      via: 'location_id'
    },
    transitions: {
      collection: 'transition',
      via: 'location_id'
    },
  }
};