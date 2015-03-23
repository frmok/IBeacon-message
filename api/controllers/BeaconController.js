/**
 * BeaconController
 *
 * @description :: Server-side logic for managing beacons
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    /**
     * This method returns the list of beacons
     *
     * @method index
     * @return {Array} Returns an array of beacons on success
     */
    index: function(req, res) {
        Beacon
            .find()
            .populate('location_id')
            .exec(function(err, beacons) {
                if (err) {
                    res.send(500, {
                        error: "FATAL ERROR"
                    });
                } else {
                    res.send(beacons);
                }
            });
    },

    /**
     * This method creates a new beacon and returns it
     *
     * @method create
     * @param major {Integer} The major of beacon
     * @param minor {Integer} The minor of beacon
     * @param location_id {Integer} The id of location
     * @return {Object} Returns a beacon object on success
     */
    create: function(req, res) {
        var major = req.param("major");
        var minor = req.param("minor");
        var location_id = req.param("location_id");
        Beacon
            .create({
                major: major,
                minor: minor,
                location_id: location_id
            })
            .exec(function(err, beacon) {
                if (err) {
                    console.log(err);
                    res.send(500, {
                        error: "FATAL ERROR"
                    });
                } else {
                    res.send(beacon);
                }
            });
    },

    /**
     * This method updates a existing beacon and returns it
     *
     * @method update
     * @param major {Integer} The major of beacon
     * @param minor {Integer} The minor of beacon
     * @return {Object} Returns a beacon object on success
     */
    update: function(req, res) {
        var id = req.param("id");
        var major = req.param("major");
        var minor = req.param("minor");
        Beacon
            .update({
                id: id
            }, {
                major: major,
                minor: minor
            })
            .exec(function(err, beacon) {
                if (err) {
                    console.log(err);
                    res.send(500, {
                        error: "FATAL ERROR"
                    });
                } else {
                    res.send(beacon[0]);
                }
            });
    },

    /**
     * This method deletes a beacon
     *
     * @method delete
     * @param id {Integer} The id of beacon
     * @return {Object} Returns a object with debug message
     */
    delete: function(req, res) {
        var id = req.param("id");
        Beacon
            .destroy({
                id: id
            })
            .exec(function(err) {
                if (err) {
                    console.log(err);
                    res.send(500, {
                        error: "FATAL ERROR"
                    });
                } else {
                    res.send(200, {
                        debug: "SUCCESS"
                    });
                }
            });
    },
};