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
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  index: function(req, res) {
    Beacon
      .find()
      .populate('location_id')
      .exec(function(err, beacons) {
        if (err) {
          res.send(500, {
            debug: "FATAL ERROR"
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
   * @param {Object} req - The request object
   * @param {Integer} req.body.minor - The major of beacon
   * @param {Integer} req.body.major - The minor of beacon
   * @param {Integer} req.body.location_id - The id of location
   * @param {Object} res - The response object
   */
  create: function(req, res) {
    var major = req.param("major");
    var minor = req.param("minor");
    var location_id = req.param("location_id");

    //check for duplicated beacon
    Beacon.find({
      major: major,
      minor: minor
    }).exec(function(err, beacon) {
      if (err) {
        console.log(err);
        res.send(500, {
          debug: "FATAL ERROR"
        });
      } else {
        if (beacon.length > 0) {
          res.send(500, {
            debug: "DUPLICATED BEACONS"
          });
        } else {
          addBeacon();
        }
      }
    });

    function addBeacon() {
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
    }
  },

  /**
   * This method updates a existing beacon and returns it
   *
   * @method update
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of beacon
   * @param {Integer} req.body.minor - The major of beacon
   * @param {Integer} req.body.major - The minor of beacon
   * @param {Object} res - The response object
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
            debug: "No beacons found"
          });
        } else {
          if (beacon.length > 0) {
            res.send(beacon[0]);
          } else {
            res.send(500, {
              debug: "No beacons found"
            });
          }
        }
      });
  },

  /**
   * This method deletes a beacon
   *
   * @method delete
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of beacon
   * @param {Object} res - The response object
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
            debug: "FATAL ERROR"
          });
        } else {
          res.send(200, {
            debug: "SUCCESS"
          });
        }
      });
  },
};