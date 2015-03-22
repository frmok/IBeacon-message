/**
* TransitionController
*
* @description :: Server-side logic for managing transitions
* @help        :: See http://links.sailsjs.org/docs/controllers
*/

module.exports = {
    /**
    * This method returns the list of transitions
    *
    * @method index
    * @return {Array} Returns an array of transitions on success
    */
    index: function (req, res){
        Transition
        .find()
        .populate('location_id')
        .populate('next_location')
        .exec(function(err, transitions) {
            if(err){
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(transitions);
            }
        });
    },

    /**
    * This method creates a new transition and returns it
    *
    * @method create
    * @param identifier {String} The device token
    * @param location_id {String} The id of location
    * @return {Object} Returns a location object on success
    */
    create: function (req, res){
        var identifier = req.param("identifier");
        var location_id = req.param("location_id");
        Transition.
        create({ identifier: identifier, location_id: location_id })
        .exec(function(err, transition) {
            if(err){
                console.log(err);
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(transition);
            }
        });
    },

    /**
    * This method updates a existing transition and returns it
    *
    * @method update
    * @param id {Integer} The id of transition
    * @param next_location {String} The id of next location
    * @return {Object} Returns a location object on success
    */
    update: function (req, res){
        var id = req.param("id");
        var next_location = req.param("next_location");
        Transition.
        update({ id: id }, { next_location: next_location})
        .exec(function(err, transition) {
            if(err){
                console.log(err);
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(transition);
            }
        });
    },


};

