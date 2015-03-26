/**
 * TransitionController
 *
 * @description :: Server-side logic for managing transitions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


var mylog = (function() {
	var time = [];
	var clc = require('cli-color');

	function colorText(id) {
		var f = [clc.white, clc.red, clc.green, clc.yellow, clc.blue, clc.magenta, clc.cyan, clc.black];
		return f[(id % f.length)];
	}

	return function(string, id) {
		if (!id) id = 0;
		if (!time[id]) time[id] = (new Date()).getTime();
		var currentTime = (new Date()).getTime();

		var sss = ['\t'.concat(id.toString()), (currentTime - time[id]).toString().concat('ms'), string].join(' ');

		console.log(colorText(id)(sss));
		time[id] = currentTime;
	};
})();

var Agenda = require('agenda');
var agenda = new Agenda({db: { address: 'localhost:27017'}});
agenda.start();

agenda.define('print msg', function(job, done) {
  mylog("abc 1232", 1);
  done();
});
mylog("abc 1232", 1);
agenda.schedule('in 20 seconds', 'print msg').repeatEvery('3 seconds');

module.exports = {

	test: function(req, res) {
		var msg = req.query.msg;
		var current = new Date();
		var delay = req.query.delay;

		agenda.define('push msg', function(job, done) {
			var pushMsg = job.attrs.data.msg;
			mylog(pushMsg, 2);
			// server push msg
			// unlock the job for async
			done();
		});

		agenda.schedule('in 3 seconds', 'push msg', {msg: 'push me~~!!'});

		mylog(current.toLocaleString())
		setTimeout(function () {
			mylog(msg, 2);
		}, delay);

		res.send("abc").end();
	},




  /**
   * This method returns the list of transitions
   *
   * @method index
   * @return {Array} Returns an array of transitions on success
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
   * @param id {Integer} The id of location
   * @return {Array} Returns an array of transitions on success
   */
  atLocation: function(req, res) {
    var location_id = req.param("id");
    Transition
      .find({
        location_id: location_id,
        next_location: 0
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
   * @return {Array} Returns an array of transitions on success
   */
  log: function(req, res) {
    var location_id = req.param("id");
    Transition
      .find({
        location_id: location_id,
        next_location: {
          '>': 0
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
   * @param identifier {String} The device token
   * @param location_id {String} The id of location
   * @return {Object} Returns a location object on success
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
   * @param id {Integer} The id of transition
   * @param next_location {String} The id of next location
   * @return {Object} Returns a location object on success
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
   * @param pollID {Integer} The id of KEEP Poll question
   * @param location_id {Integer} The id of location
   * @return {Object} Returns a object with debug message
   */
  sendQuestion: function(req, res) {
    var pollID = req.param("pollID");
    var location_id = req.param("location_id");
    Transition
      .find({
        location_id: location_id,
        next_location: 0
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
          Push.send(pollID, identifiers);
          res.json({
            message: 'Successfully sent'
          });
        }
      });
  },

  subscribeToTransition: function(req, res) {
    var roomName = 'transition';
    sails.sockets.join(req.socket, roomName);
    res.json({
      message: 'Subscribed to a room called ' + roomName
    });
  },
};
