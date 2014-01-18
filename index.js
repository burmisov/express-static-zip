var fs = require('fs');

var zip = require('zip');
var mime = require('mime');

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
	
	// Dispose of temporary data, which is potentially big
	delete data;
	delete reader;

	return function (req, res, next) {
		if (req.method != 'GET' && req.method != 'HEAD') return next();

		// Strip the leading '/'
		var name = req.path.slice(1);
		// Search for path in the directory
		if (zipDir.hasOwnProperty(name)) {
			// If found, respond with uncompressed file data
			var zipEntry = zipDir[name];
			var entryData = zipEntry.getData();

			var contentType = mime.lookup(name);
			if(contentType != 'application/octet-stream') {
				res.set('Content-type', contentType);
				var charSet = mime.charsets.lookup(contentType);
				if(charSet) {
					entryData = entryData.toString(mime.charsets.lookup(contentType));
				}
			}

			res.send(200, entryData);
		} else {
			return next();
		}
	};
};