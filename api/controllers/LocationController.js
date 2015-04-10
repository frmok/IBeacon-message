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
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  index: function(req, res) {
    Location
      .find()
      .populate('transitions', {
        where: {
          next_location: null
        }
      })
      .sort({
        name: 'asc'
      })
      .exec(function(err, locations) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(locations);
        }
      });
  },

  /**
   * This method returns the data of a location
   *
   * @method detail
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of location
   * @param {Object} res - The response object
   */
  detail: function(req, res) {
    var id = req.param("id");
    Location
      .find({
        id: id
      })
      .populate('beacons')
      .exec(function(err, location) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          //calculate the number of people
          Transition
            .count({
              location_id: location[0].id,
              next_location: null
            })
            .exec(function(err, count) {
              location[0].people = count;
              res.send(location[0]);
            });
        }
      });
  },

  /**
   * This method returns the data of a location
   *
   * @method getByBeacon
   * @param {Object} req - The request object
   * @param {Integer} req.query.major - The major of beacon
   * @param {Integer} req.query.minor - The minor of beacon
   * @param {Object} res - The response object
   */
  getByBeacon: function(req, res) {
    var major = req.param("major");
    var minor = req.param("minor");
    Beacon
      .find({
        major: major,
        minor: minor
      })
      .populate('location_id', {
        where: {
          disabled: 0
        }
      })
      .exec(function(err, beacon) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          if (beacon.length === 0) {
            res.send(200, {
              debug: "NO LOCATION FOUND"
            });
          } else {
            if (beacon[0].location_id === undefined) {
              res.send(200, {
                debug: "NO LOCATION FOUND"
              });
            } else {
              res.send(beacon[0].location_id);
            }
          }
        }
      });
  },

  /**
   * This method creates a new location and returns it
   *
   * @method create
   * @param {Object} req - The request object
   * @param {String} req.body.name - The name of location
   * @param {Integer} req.body.disabled - Whether the location is disabled (1:YES, 0:NO)
   * @param {Object} res - The response object
   */
  create: function(req, res) {
    var name = req.param("name");
    var disabled = parseInt(req.param("disabled"));
    var distance = parseFloat(req.param("distance"));
    var msgType = parseInt(req.param("msgType"));
    var msgContent = req.param("msgContent");
    var msgText = req.param("msgText");
    Location
      .create({
        name: name,
        disabled: disabled,
        distance: distance,
        msgType: msgType,
        msgContent: msgContent,
        msgText: msgText
      })
      .exec(function(err, location) {
        if (err) {
          console.log(err);
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(location);
        }
      });
  },

  /**
   * This method updates a existing location and returns it
   *
   * @method update
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of location
   * @param {String} req.body.name - The name of location
   * @param {Integer} req.body.disabled - Whether the location is disabled (1:YES, 0:NO)
   * @param {Object} res - The response object
   */
  update: function(req, res) {
    var id = req.param("id");
    var name = req.param("name");
    var disabled = parseInt(req.param("disabled"));
    var distance = parseFloat(req.param("distance"));
    var msgType = parseInt(req.param("msgType"));
    var msgContent = req.param("msgContent");
    var msgText = req.param("msgText");
    Location
      .update({
        id: id
      }, {
        name: name,
        disabled: disabled,
        distance: distance,
        msgType: msgType,
        msgContent: msgContent,
        msgText: msgText
      })
      .exec(function(err, location) {
        if (err) {
          console.log(err);
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(location[0]);
        }
      });
  },

  /**
   * This method deletes a location
   *
   * @method delete
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of location
   * @param {Object} res - The response object
   */
  delete: function(req, res) {
    var id = req.param("id");
    Location
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
          //delete all the beacons belong to this location
          Beacon
            .find({
              location_id: id
            })
            .exec(function(err, beacons) {
              var beaconIDs = beacons.map(function(beacon) {
                return beacon.id;
              });
              Beacon.destroy({
                id: beaconIDs
              }).exec(function(err) {
                res.send(200, {
                  debug: "SUCCESS"
                });
              });
            });
        }
      });
  },

};