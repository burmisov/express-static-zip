var testZipPath = 'testdata.zip';
var testZipReferencePath = 'testdata/';
var otherUrlPath = '/some/other/lib/path';

var path = require('path');
var express = require('express');
var request = require('supertest');
var staticZip = require('../index.js');
var should = require('should');

var app = express();

var zipFullPath = path.join(__dirname, testZipPath);
var otherUrlPath2 = otherUrlPath + otherUrlPath;
var otherUrlPath3 = otherUrlPath2 + otherUrlPath;

var staticZipRoot = staticZip(zipFullPath);

app.use(staticZipRoot);
app.use(otherUrlPath, staticZipRoot);
app.use(otherUrlPath2, staticZip(zipFullPath, {zipRoot: "a-folder/"}));
app.use(otherUrlPath3, staticZip(zipFullPath, {skip: ["a-folder/file-in-a-folder.txt"]}));

describe('Serving files from root of zip on root url path', function () {
	it('serves file matching zip content', function (done) {
		request(app)
			.get('/some-file.txt')
			.expect(200)
			.expect('Content-type', /text\/plain/)
			.expect('File 1 content')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('responds 404 when file path does not match zip content', function (done) {
		request(app)
			.get('/some-missing-file.txt')
			.expect(404)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('serves file from zip subfolder', function (done) {
		request(app)
			.get('/a-folder/file-in-a-folder.txt')
			.expect(200)
			.expect('Content-type', /text\/plain/)
			.expect('File-in-a-folder content.')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('serves an image file from zip', function (done) {
		request(app)
			.get('/some-image.png')
			.expect(200)
			.expect('Content-type', 'image/png')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('serves file on non-empty mount path', function (done) {
		request(app)
			.get(otherUrlPath + '/some-file.txt')
			.expect(200)
			.expect('Content-type', /text\/plain/)
			.expect('File 1 content')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('obeys the "zipRoot" option', function (done) {
		request(app)
			.get(otherUrlPath2 + '/file-in-a-folder.txt')
			.expect(200)
			.expect('Content-type', /text\/plain/)
			.expect('File-in-a-folder content.')
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});	
	});

	it('throws on non-existent zip file', function () {
		(function () {
			var mw = staticZip('non-existent-zip.zip');
		}).should.throw();
	});

	it('doesnt respond to a POST request', function (done) {
		request(app)
			.post('/some-file.txt')
			.expect(404)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('doesnt respond to a PUT request', function (done) {
		request(app)
			.put('/some-file.txt')
			.expect(404)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('obeys the "skip" option', function (done) {
		request(app)
			.get(otherUrlPath3 + '/a-folder/file-in-a-folder.txt')
			.expect(404)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('throws on incorrect "zipRoot" option', function () {
		(function () {
			var mw = staticZip(zipFullPath, {zipRoot: true});
		}).should.throw();
	});

	it('throws on incorrect "skip" option', function () {
		(function () {
			var mw = staticZip(zipFullPath, {skip: "/some-file.txt"});
		}).should.throw();
	});

	it('throws on incorrect "skip" option array item', function () {
		(function () {
			var mw = staticZip(zipFullPath, {skip: ["/some-file.txt", false]});
		}).should.throw();
	});
});
