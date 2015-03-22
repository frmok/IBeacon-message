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
    index: function (req, res){
        Beacon
        .find()
        .populate('location_id')
        .exec(function(err, beacons) {
            if(err){
                res.send(500, { error: "FATAL ERROR" });
            }else{
                res.send(beacons);
            }
        });
    },
};

