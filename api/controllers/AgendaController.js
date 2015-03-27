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
      res.send(jobs);
    });
  },

  create: function(req, res) {
    var jobName = req.param('name');
    var msg = req.param('msg');
    agenda.define(jobName, function(job, done) {
      // var currentDate = new Date().getTime();
      // var startDate = job.attrs.data.startDate;
      // var endDate = job.attrs.data.endDate;
      // console.log(currentDate);
      // console.log(startDate);
      // console.log(endDate);
      // console.log(currentDate >= startDate && currentDate <= endDate);
      // if (currentDate >= startDate && currentDate <= endDate) {
      console.log(new Date() + ' ' + msg);
      //Push.sendQuestion(4, ['bbe8a5c7d5418a6a25110dc7b159075d0f3c4ba3a13040317e9defa740231ce4']);
      //job.attrs.data.lastRun = job.attrs.lastRunAt.getTime();
      job.schedule(new Date(new Date().getTime() + 5000));
      job.save(function(err) {
        done();
      });
      // }
    });
    agenda.schedule(new Date(new Date().getTime() + 15000), jobName, {
      msg: msg
    });
    res.json({
      message: "Message created"
    });
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