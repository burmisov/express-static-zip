var fs = require('fs');

var zip = require('zip');
var mime = require('mime');

module.exports = function (pathToZip, options) {
	options = options || {};
	// Set path inside zip file as root path
	options.zipRoot = options.zipRoot || "";
	// Do not serve files with full paths in this array (relative to zipRoot)
	options.skip = options.skip || [];

	// Check option types
	if (typeof(options.zipRoot) !== 'string') {
		throw new Error('Option "zipRoot" should be a string');
	}
	if (!(Array.isArray(options.skip))) {
		throw new Error('Option "skip" should be an array of strings');
	}
	options.skip.forEach(item => {
		if (typeof(item) !== 'string') {
			throw new Error('Option "skip" should be an array of strings');
		}
	});

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

	if (Object.keys(zipDir).length === 0)
		throw new Error("No files were found! Please check your zipRoot");
	
	// Let GC dispose of temporary data, which is potentially big
	data = null;
	reader = null;

    var prepFilePath = function (originUrl, filePath) {
        try {
            var arr = originUrl.split('/');
            var fileName = arr[arr.length - 1];

            if (fileName.indexOf('?') != -1) {
                fileName = fileName.substring(0, fileName.indexOf('?'));
            }

            var arr2 = filePath.split('/');
            arr2[arr2.length - 1] = fileName;
            var resultStr = arr2.join('/');
            return resultStr.slice(1);
        }
        catch (err) {
            console.log('err prepFilePath: ', err);
            return filePath.slice(1);
        }
    };

	return function (req, res, next) {
		if (req.method != 'GET' && req.method != 'HEAD') return next();
		// Strip the leading '/'
		var name = prepFilePath(req.originalUrl, req.path);
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
			res.status(200).send(entryData);
		} else {
			return next();
		}
	};
};
