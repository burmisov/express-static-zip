var testZipPath = './testdata.zip';
var testZipReferencePath = './testdata/';

var fs = require('express');
var express = require('express');
var request = require('supertest');
var staticZip = require('../index.js');

var app = express();

app.use(staticZip(__dirname + '/testdata.zip'));

request(app)
	.get('/some-file.txt')
	.expect(200)
	.end(function (err, res) {
		if (err) throw err;
	});