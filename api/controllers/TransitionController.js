/**
 * TransitionController
 *
 * @description :: Server-side logic for managing transitions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Agenda = require('agenda');
var agenda = new Agenda({
  db: {
    address: 'localhost:27017/agenda-example'
  }
});
module.exports = {

  //http://localhost:1337/transition/test/?msg=xxx&delay=3000
  test: function(req, res) {
    var msg = req.query.msg;
    var current = new Date();
    var delay = req.query.delay;

    agenda.cancel({}, function(err, numRemoved) {});
    //agenda.every('5 seconds', 'delete old users');
    agenda.schedule(new Date(new Date().getTime()+15000), 'delete old users');
    agenda.jobs({}, function(err, jobs) {
      // Check the job list
      console.log(jobs);
      res.send(jobs).end();
    });

  },



  /**
   * This method returns the list of transitions
   *
   * @method index
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  index: function(req, res) {
    Transition
      .find()
      .populate('location_id')
      .populate('next_location')
      .exec(function(err, transitions) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(transitions);
        }
      });
  },

  /**
   * This method returns the list of (non-left) transitions of a particular location
   *
   * @method atLocation
   * @param {Object} req - The request object
   * @param {Integer} req.params.id - The id of location
   * @param {Object} res - The response object
   */
  atLocation: function(req, res) {
    var location_id = req.param("id");
    Transition
      .find({
        location_id: location_id,
        next_location: null
      })
      .exec(function(err, transitions) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(transitions);
        }
      });
  },

  /**
   * This method returns the transition log of a location
   *
   * @method log
   * @param id {Integer} The id of location
   * @param {Object} req - The request object
   * @param {Integer} req.params.id - The id of location
   * @param {Object} res - The response object
   */
  log: function(req, res) {
    var location_id = req.param("id");
    Transition
      .find({
        location_id: location_id,
        next_location: {
          '!': null
        }
      })
      .populate('location_id')
      .populate('next_location')
      .exec(function(err, transitions) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          var transition_entered = [];
          var transition_left = [];
          var all_transitions = [];
          var moment = require('moment');
          transition_entered = JSON.parse(JSON.stringify(transitions));
          transition_left = JSON.parse(JSON.stringify(transitions));
          for (var i = 0; i < transition_entered.length; i++) {
            transition_entered[i].timestamp = moment(transition_entered[i].createdAt, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            transition_entered[i].action = "Enter";
            all_transitions.push(transition_entered[i]);
          }
          for (var i = 0; i < transition_left.length; i++) {
            transition_left[i].timestamp = moment(transition_left[i].updatedAt, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (transition_left[i].next_location) {
              if (transition_left[i].location_id.id === transition_left[i].next_location.id) {
                transition_left[i].action = "Leave";
              } else {
                transition_left[i].action = "Go to " + transition_left[i].next_location.name;
              }
              all_transitions.push(transition_left[i]);
            }
          }
          res.send(all_transitions);
        }
      });
  },

  /**
   * This method creates a new transition and returns it
   *
   * @method create
   * @param {Object} req - The request object
   * @param {String} req.body.identifier - The device token
   * @param {Integer} req.body.location_id - The id of location
   * @param {Object} res - The response object
   */
  create: function(req, res) {
    var identifier = req.param("identifier");
    var location_id = req.param("location_id");
    Transition
      .create({
        identifier: identifier,
        location_id: location_id
      })
      .exec(function(err, transition) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(transition);
        }
      });
  },

  /**
   * This method updates a existing transition and returns it
   *
   * @method update
   * @param {Object} req - The request object
   * @param {Integer} req.body.id - The id of transition
   * @param {String} req.body.next_location - The id of next location
   * @param {Object} res - The response object
   */
  update: function(req, res) {
    var id = req.param("id");
    var next_location = req.param("next_location");
    Transition
      .update({
        id: id
      }, {
        next_location: next_location
      })
      .exec(function(err, transition) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          res.send(transition);
        }
      });
  },

  /**
   * This method sends a KEEP Poll question to all (non-left) transition of a locaiton
   *
   * @method sendQuestion
   * @param {Object} req - The request object
   * @param {Integer} req.body.pollID - The id of KEEP Poll question
   * @param {Integer} req.body.location_id - The id of location
   * @param {Object} res - The response object
   */
  sendQuestion: function(req, res) {
    var pollID = req.param("pollID");
    var location_id = req.param("location_id");
    Transition
      .find({
        location_id: location_id,
        next_location: null
      })
      .exec(function(err, transitions) {
        if (err) {
          res.send(500, {
            error: "FATAL ERROR"
          });
        } else {
          var identifiers = [];
          for (i = 0; i < transitions.length; i++) {
            identifiers.push(transitions[i].identifier);
          }
          Push.sendQuestion(pollID, identifiers);
          res.json({
            message: 'Successfully sent'
          });
        }
      });
  },

  /**
   * This method allows client to subscribe to the transition update
   *
   * @method subscribeToTransition
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  subscribeToTransition: function(req, res) {
    var roomName = 'transition';
    sails.sockets.join(req.socket, roomName);
    res.json({
      message: 'Subscribed to a room called ' + roomName
    });
  },
};