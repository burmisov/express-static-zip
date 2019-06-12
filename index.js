var fs = require('fs');

var zip = require('zipread');
var mime = require('mime');
var mimeDB = require('mime-db');

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
  for (var key in options.skip) {
    if (typeof(options.skip[key]) !== 'string') {
      throw new Error('Option "skip" should be an array of strings');
    }
  }

  // Zip contents registry; keys are zip entry names
  var zipDir = {};

  // Read zip contents and populate the registry
  var reader = zip(pathToZip);
  var zipRootLen = options.zipRoot.length;
  Object.values(reader.files).forEach(function (entry) {
    // Only take file entries (ignore directories)
    if (entry.dir === true) return;
    var entryName = entry.name;

    // Only take files in zipRoot path
    if (options.zipRoot !== entryName.slice(0, zipRootLen)) return;
    let entryRelPath = entryName.slice(zipRootLen);
    
    //Skip entries from the "skip" list
    if (options.skip.indexOf(entryRelPath) !== -1) return;

    zipDir[entryRelPath] = entry;
  });

  return function (req, res, next) {
    if (req.method != 'GET' && req.method != 'HEAD') return next();

    // Strip the leading '/'
    var name = prepFilePath(req.originalUrl, req.path);
    // Search for path in the directory
    if (zipDir.hasOwnProperty(name)) {
      // If found, respond with uncompressed file data
      var entryData = reader.readFileSync(options.zipRoot + name);

      // Set Content-Type and decode buffer if needed
      var contentType = mime.getType(name);
      if (contentType != 'application/octet-stream') {
        res.set('Content-type', contentType);
        var charSet = mimeDB[contentType].charset;
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
