/**
 * AgendaController
 *
 * @description :: Server-side logic for managing transitions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Agenda = require('agenda');
var mongodb = require('mongodb');
var agenda = new Agenda({
  db: {
    address: 'direct.andymok.me:27017/agenda-example'
  }
});
module.exports = {
  /**
   * This method returns the list of advertisements
   *
   * @method index
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  index: function(req, res) {
    agenda.jobs({}, function(err, jobs) {
      if (err) {
        res.send(500, {
          error: "FATAL ERROR"
        });
      }
      if (jobs.length == 0) {
        res.send(jobs);
      } else {
        var all = 0;
        for (i in jobs) {
          (function(jobs, i) {
            Location
              .find({
                id: jobs[i].attrs.data.location_id
              }).exec(function(err, location) {
                all++;
                jobs[i].attrs.location = location[0].name;
                if (all == jobs.length) {
                  (function(jobs) {
                    res.send(jobs);
                  })(jobs);
                }
              });
          })(jobs, i)
        }
      }
    });
  },
  /**
   * This method returns the data of an advertisement
   *
   * @method create
   * @param {Object} req - The request object
   * @param {String} req.query.id - The id of advertisement
   * @param {Object} res - The response object
   */
  detail: function(req, res) {
    var id = req.param('id');
    agenda.jobs({
      _id: mongodb.ObjectID(id)
    }, function(err, jobs) {
      if (err) {
        res.send(500, {
          error: "FATAL ERROR"
        });
      }
      if (jobs.length > 0) {
        res.send(jobs[0]);
      } else {
        res.send(500, {
          error: "No advertisement found"
        });
      }
    });
  },
  /**
   * This method creates a new advertisement and returns it
   *
   * @method create
   * @param {Object} req - The request object
   * @param {String} req.body.jobName - The name of advertisement
   * @param {String} req.body.msgText - The text of the notification
   * @param {String} req.body.msgContent - The actual content of the notification
   * @param {Integer} req.body.msgType - The type of notification
   * @param {Date} req.body.startDate - The start date of notification
   * @param {Date} req.body.endDate - The end date of notification
   * @param {Integer} req.body.repeatInterval - The repeat interval of notification
   * @param {Integer} req.body.location_id - The id of location
   * @param {Object} res - The response object
   */
  create: function(req, res) {
    var jobName = req.param('name');
    var msgText = req.param('msgText');
    var msgContent = req.param('msgContent');
    var msgType = req.param('msgType');
    var startDate = req.param('startDate');
    var endDate = req.param('endDate');
    var repeatInterval = req.param('repeatInterval');
    var location_id = req.param('location_id');
    var eventStartDate = req.param("eventStartDate");
    var eventEndDate = req.param("eventEndDate");
    agenda.define(jobName, function(job, done) {
      var currentDate = new Date().getTime();
      var msgText = job.attrs.data.msgText;
      var msgContent = job.attrs.data.msgContent;
      var msgType = parseInt(job.attrs.data.msgType);
      var startDate = job.attrs.data.startDate;
      var endDate = job.attrs.data.endDate;
      var repeatInterval = job.attrs.data.repeatInterval;
      var location_id = job.attrs.data.location_id;
      var eventStartDate = job.attrs.data.eventStartDate;
      var eventEndDate = job.attrs.data.eventEndDate;
      var msgOptions = {
        msgType: msgType,
        msgContent: msgContent,
        msgText: msgText,
        recordId: '',
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
      };
      if (currentDate >= startDate && currentDate <= endDate || currentDate >= startDate && startDate == endDate) {
        console.log(new Date() + ' ' + msgText);
        Transition
          .find({
            location_id: location_id,
            next_location: null
          })
          .exec(function(err, transitions) {
            var identifiers = [];
            for (i = 0; i < transitions.length; i++) {
              identifiers.push(transitions[i].identifier);
            }
            Record
              .create({
                people_count: identifiers.length,
                actual_count: 0,
                agenda_id: job.attrs._id.toString()
              })
              .exec(function(err, record) {
                if (err) {
                  console.log(err);
                } else {
                  msgOptions.recordId = record.id;
                  Push.sendMessage(msgOptions, identifiers);
                }
              });
          });
      }
      if (currentDate < endDate) {
        job.schedule(new Date(new Date().getTime() + repeatInterval * 60 * 1000));
      }
      job.save(function(err) {
        done();
      });
    });
    agenda.schedule(new Date(startDate), jobName, {
      msgText: msgText,
      msgType: parseInt(msgType),
      msgContent: msgContent,
      startDate: startDate,
      endDate: endDate,
      repeatInterval: repeatInterval,
      location_id: location_id,
      eventStartDate: eventStartDate,
      eventEndDate: eventEndDate,
    });
    res.json({
      message: "Message created"
    });
    agenda.start();
  },

  /**
   * This method deletes a specific advertisement
   *
   * @method delete
   * @param {Object} req - The request object
   * @param {String} req.body.id - The advertisement id
   * @param {Object} res - The response object
   */
  delete: function(req, res) {
    var id = req.param('id');
    agenda.cancel({
      _id: mongodb.ObjectID(id),
    }, function(err, numRemoved) {
      if (err) {
        res.send(500, {
          debug: "FATAL ERROR"
        });
      }
      res.json({
        debug: "SUCCESS"
      });
    });
  },

  clear: function(req, res) {
    agenda.cancel({}, function(err, numRemoved) {});
    res.json({
      message: "Message cleared"
    });
  }

}