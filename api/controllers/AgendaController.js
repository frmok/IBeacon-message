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
  index: function(req, res) {
    agenda.jobs({}, function(err, jobs) {
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
      res.send(jobs[0]);
    });
  },

  create: function(req, res) {
    var jobName = req.param('name');
    var msgText = req.param('msgText');
    var msgContent = req.param('msgContent');
    var msgType = req.param('msgType');
    var startDate = req.param('startDate');
    var endDate = req.param('endDate');
    var repeatInterval = req.param('repeatInterval');
    var location_id = req.param('location_id');
    agenda.define(jobName, function(job, done) {
      var currentDate = new Date().getTime();
      var msgText = job.attrs.data.msgText;
      var msgContent = job.attrs.data.msgContent;
      var msgType = job.attrs.data.msgType;
      var startDate = job.attrs.data.startDate;
      var endDate = job.attrs.data.endDate;
      var repeatInterval = job.attrs.data.repeatInterval;
      var location_id = job.attrs.data.location_id;
      var msgOptions = {
        msgType: msgType,
        msgContent: msgContent,
        msgText: msgText
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
            Push.sendMessage(msgOptions, identifiers);
            Record
              .create({
                people_count: identifiers.length,
                agenda_id: job.attrs._id.toString()
              })
              .exec(function(err, record) {
                if (err) {
                  console.log(err);
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
      msgType: msgType,
      msgContent: msgContent,
      startDate: startDate,
      endDate: endDate,
      repeatInterval: repeatInterval,
      location_id: location_id,
    });
    res.json({
      message: "Message created"
    });
    agenda.start();
  },

  delete: function(req, res) {
    var id = req.param('id');
    agenda.cancel({
      _id: mongodb.ObjectID(id),
    }, function(err, numRemoved) {
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