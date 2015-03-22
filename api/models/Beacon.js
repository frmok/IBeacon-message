/**
* Beacon.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    tableName: 'beacon',
    attributes: {

        major: {
            type: 'integer'
        },
        minor: {
            type: 'integer'
        },
        location_id: {
            model: 'location'
        }
    }
};

