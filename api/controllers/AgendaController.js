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
    address: 'localhost:27017/agenda-example'
  }
});
module.exports = {

  index: function(req, res) {
    agenda.jobs({}, function(err, jobs) {
      for (i in jobs) {
        (function(jobs, i) {
          Location
            .find({
              id: jobs[i].attrs.data.location_id
            }).exec(function(err, location) {
              jobs[i].attrs.location = location[0].name;
              if (i == jobs.length - 1) {
                (function(jobs) {
                  res.send(jobs);
                })(jobs);
              }
            });
        })(jobs, i)
      }
    });
  },

  create: function(req, res) {
    var jobName = req.param('name');
    var msg = req.param('msg');
    var startDate = req.param('startDate');
    var endDate = req.param('endDate');
    var repeatInterval = req.param('repeatInterval');
    var location_id = req.param('location_id');
    agenda.define(jobName, function(job, done) {
      var currentDate = new Date().getTime();
      var msg = job.attrs.data.msg;
      var startDate = job.attrs.data.startDate;
      var endDate = job.attrs.data.endDate;
      var repeatInterval = job.attrs.data.repeatInterval;
      var location_id = job.attrs.data.location_id;
      if (currentDate >= startDate && currentDate <= endDate || currentDate >= startDate && startDate == endDate) {
        console.log(new Date() + ' ' + msg);
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
            Push.sendQuestion('4', identifiers);
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
      msg: msg,
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
        message: id
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