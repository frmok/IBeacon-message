/**
 * AgendaController
 *
 * @description :: Server-side logic for managing transitions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Agenda = require('agenda');
var agenda = new Agenda({
  db: {
    address: 'localhost:27017'
  }
});
module.exports = {

  index: function(req, res) {
    agenda.jobs({}, function(err, jobs) {
      res.send(jobs);
    });
  }

}