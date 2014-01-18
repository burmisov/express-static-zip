var testZipPath = 'testdata.zip';
var testZipReferencePath = 'testdata/';

var path = require('path');
var express = require('express');
var request = require('supertest');
var staticZip = require('../index.js');

var app = express();

var otherUrlPath = '/some/other/lib/path';

var staticZipRoot = staticZip(path.join(__dirname, testZipPath));

app.use(staticZipRoot);
app.use(otherUrlPath, staticZipRoot);

describe('Serving files from root of zip on root url path', function () {
	it('should correctly serve file matching zip content', function (done) {
		request(app)
			.get('/some-file.txt')
			.expect(200)
			.expect('Content-type', 'text/plain')
			.expect('File 1 content')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('should return 404 when file path does not match zip content', function (done) {
		request(app)
			.get('/some-missing-file.txt')
			.expect(404)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('should correctly serve file from zip subfolder', function (done) {
		request(app)
			.get('/a-folder/file-in-a-folder.txt')
			.expect(200)
			.expect('Content-type', 'text/plain')
			.expect('File-in-a-folder content.')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('should correctly serve an image file from zip', function (done) {
		request(app)
			.get('/some-image.png')
			.expect(200)
			.expect('Content-type', 'image/png')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('should correctly serve file on non-empty path', function (done) {
		request(app)
			.get(otherUrlPath + '/some-file.txt')
			.expect(200)
			.expect('Content-type', 'text/plain')
			.expect('File 1 content')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});
});
