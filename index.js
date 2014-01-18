var fs = require('fs');

var zip = require('zip');

module.exports = function (pathToZip) {
	// Zip contents registry; keys are zip entry names
	var zipDir = {};

	// Read zip contents and populate the registry
	var data = fs.readFileSync(pathToZip);
	var reader = zip.Reader(data);
	reader.forEach(function (entry) {
		// Only take file entries (ignore directories)
		if (entry.isFile()) {
			zipDir[entry.getName()] = entry;	
		}		
	});	

	return function (req, res, next) {
		if (req.method != 'GET' && req.method != 'HEAD') return next();
		
		return next();
	};
};