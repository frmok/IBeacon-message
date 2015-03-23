/**
* LocationController
*
* @description :: Server-side logic for managing locations
*/

module.exports = {

    /**
    * This method returns the list of locations
    *
    * @method index
    * @return {Array} Returns an array of locations on success
    */
    index: function (req, res){
        Location
        .find()
        .populate('beacons')
        .exec(function(err, locations) {
            if(err){
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(locations);
            }
        });
    },

    /**
    * This method returns the data of a location
    *
    * @method index
    * @param id {Integer} The id of location
    * @return {Array} Returns data of a location on success
    */
    detail: function (req, res){
        var id = req.param("id");
        Location
        .find({ id: id })
        .populate('beacons')
        .exec(function(err, location) {
            if(err){
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(location[0]);
            }
        });
    },

    /**
    * This method creates a new location and returns it
    *
    * @method create
    * @param name {String} The name of location
    * @param disabled {Integer} Whether the location is disabled
    * @return {Object} Returns a location object on success
    */
    create: function (req, res){
        var name = req.param("name");
        var disabled = req.param("disabled");
        Location.
        create({ name: name, disabled: disabled })
        .exec(function(err, location) {
            if(err){
                console.log(err);
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(location[0]);
            }
        });
    },

    /**
    * This method updates a existing location and returns it
    *
    * @method update
    * @param id {Integer} The id of location
    * @param name {String} The name of location
    * @param disabled {Integer} Whether the location is disabled
    * @return {Object} Returns a location object on success
    */
    update: function (req, res){
        var id = req.param("id");
        var name = req.param("name");
        var disabled = req.param("disabled");
        Location.
        update({ id: id }, { name: name, disabled: disabled})
        .exec(function(err, location) {
            if(err){
                console.log(err);
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(location[0]);
            }
        });
    },

    /**
    * This method deletes a location
    *
    * @method delete
    * @param id {Integer} The id of location
    * @return {Object} Returns a object with debug message
    */
    delete: function (req, res){
        var id = req.param("id");
        Location.
        destroy({ id: id })
        .exec(function(err) {
            if(err){
                console.log(err);
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(200, { debug: "SUCCESS" });
            }
        });
    },

};
