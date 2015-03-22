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
        send: function(pollID){
            Push.send(pollID);
        },
    }
};

