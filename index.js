var fs = require('fs');

var zip = require('zip');

// The object class
var StaticZip = exports.StaticZip = function (pathToZip) {
	// Zip contents registry; keys are zip entry names
	this.zipDir = {};

	// Read zip contents and populate the registry
	var data = fs.readFileSync(pathToZip);
	var reader = zip.Reader(data);
	reader.forEach(function (entry) {
		// Only take file entries (ignore directories)
		if (entry.isFile()) {
			this.zipDir[entry.getName()] = entry;	
		}		
	});	
};

// The middleware itself
StaticZip.prototype.server = function (req, res, next) {
	return next();
};