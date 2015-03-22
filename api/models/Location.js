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
        beacons:{
            collection: 'beacon',
            via: 'location_id'
        }
    }
};

