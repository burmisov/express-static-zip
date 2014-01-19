var fs = require('fs');

var zip = require('zip');
var mime = require('mime');

module.exports = function (pathToZip, options) {
	options = options || {};
	// Set path inside zip file as root path
	options.zipRoot = options.zipRoot || "";
	// Do not serve files with full paths in this array (relative to zipRoot)
	options.skip = options.skip || [];

	// Zip contents registry; keys are zip entry names
	var zipDir = {};

	// Read zip contents and populate the registry
	var data = fs.readFileSync(pathToZip);
	var reader = zip.Reader(data);
	var zipRootLen = options.zipRoot.length;
	reader.forEach(function (entry) {
		// Only take file entries (ignore directories)
		if (entry.isFile()) {
			var entryName = entry.getName();
			// Only take files in zipRoot path
			if (options.zipRoot === entryName.slice(0, zipRootLen)) {
				entryRelPath = entryName.slice(zipRootLen);
				//Skip entries from the "skip" list
				if (options.skip.indexOf(entryRelPath) === -1)
					zipDir[entryRelPath] = entry;
			}
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

			// Set Content-Type and decode buffer if needed
			var contentType = mime.lookup(name);
			if (contentType != 'application/octet-stream') {
				res.set('Content-type', contentType);
				var charSet = mime.charsets.lookup(contentType);
				if (charSet) {
					entryData = entryData.toString(charSet);
				}
			}

			res.send(200, entryData);
		} else {
			return next();
		}
	};
};