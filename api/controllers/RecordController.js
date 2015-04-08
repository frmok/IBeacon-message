/**
 * RecordController
 *
 * @description :: Server-side logic for managing beacons
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  /**
   * This method returns the list of records
   *
   * @method index
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  index: function(req, res) {
    Record
      .find()
      .exec(function(err, records) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(records);
        }
      });
  },

  /**
   * This method creates a new record and returns it
   *
   * @method create
   * @param {Object} req - The request object
   * @param {Integer} req.body.people_count - The number of people
   * @param {String} req.body.agenda_id - The id of advertisement
   * @param {Object} res - The response object
   */
  create: function(req, res) {
    var people_count = req.param("people_count");
    var agenda_id = req.param("agenda_id");
    Record
      .create({
        people_count: people_count,
        actual_count: 0,
        agenda_id: agenda_id
      })
      .exec(function(err, record) {
        if (err) {
          console.log(err);
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(record);
        }
      });
  },

  addCount: function(req, res) {
    var id = req.param("id");
    Record
      .find({
        id: id
      })
      .exec(function(err, record) {
        if (record.length > 0) {
          var actual_count = record[0].actual_count;
          Record
            .update({
              id: id
            }, {
              actual_count: actual_count + 1
            }).exec(function(err, record) {
              res.send(record[0]);
            });
        } else {
          res.json({
            'debug': 'FAILURE'
          })
        }
      });

  },

  /**
   * This method returns a list of records of an advertisement
   *
   * @method byAdvertisement
   * @param {Object} req - The request object
   * @param {String} req.body.id - The id of advertisement
   * @param {Object} res - The response object
   */
  byAdvertisement: function(req, res) {
    var agenda_id = req.param("id");
    Record
      .find({
        agenda_id: agenda_id
      })
      .exec(function(err, records) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(records);
        }
      });
  },
};