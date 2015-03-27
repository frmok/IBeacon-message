/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var MongoClient = require('mongodb').MongoClient;
var _agendaURL = 'mongodb://localhost:27017/agenda-example';
var Agenda = require('agenda');
var agenda = new Agenda({
  db: {
    address: 'localhost:27017/agenda-example'
  }
});

function graceful() {
  agenda.stop(function() {
    console.log("The server shuts down gracefully.");
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
module.exports.bootstrap = function(cb) {
  MongoClient.connect(_agendaURL, function(err, db) {
    var collection = db.collection('agendaJobs');
    collection.update({}, {
      $set: {
        lockedAt: null
      }
    }, {w:1, multi: true},function(err, result) {
      console.log(result);
      _continueBoostrap();
    });
  });

  function _continueBoostrap() {
    agenda.jobs({}, function(err, jobs) {
      // Check the job list
      //console.log(jobs);
      for (i = 0; i < jobs.length; i++) {
        agenda.define(jobs[i].attrs.name, function(job, done) {
          // var currentDate = new Date().getTime();
          // var startDate = job.attrs.data.startDate;
          // var endDate = job.attrs.data.endDate;
          // console.log(currentDate);
          // console.log(startDate);
          // console.log(endDate);
          // console.log(currentDate >= startDate && currentDate <= endDate);
          // if (currentDate >= startDate && currentDate <= endDate) {
          console.log(new Date() + ' ' + job.attrs.data.msg);
          //Push.sendQuestion(4, ['bbe8a5c7d5418a6a25110dc7b159075d0f3c4ba3a13040317e9defa740231ce4']);
          //job.attrs.data.lastRun = job.attrs.lastRunAt.getTime();
          job.schedule(new Date(new Date().getTime() + 5000));
          job.save(function(err) {
            done();
          });
          // }
        });
      }
      agenda.start();
    });
    cb();
  }
};