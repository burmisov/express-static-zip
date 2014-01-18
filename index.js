var fs = require('fs');

var zip = require('zip');

// The object class
var StaticZip = exports.StaticZip = function (pathToZip) {
	// Zip contents registry; keys are zip entry names
	this.zipDir = {};
};

// The middleware itself
StaticZip.prototype.server = function (req, res, next) {
	return next();
};