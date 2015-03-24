/**
 * adminAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated admin
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  var token = req.headers['usertoken'];
  jwt.verify(token, sails.config.myconf.secret, function(err, decoded) {
    if (err || decoded.right !== 1) {
      return res.json('403', {
        debug: 'Access Denied'
      });
    }
    return next();
  });
};