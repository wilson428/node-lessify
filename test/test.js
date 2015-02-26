#!/usr/bin/env node

var fs = require("fs");
var browserify = require('browserify');
var lessify = require("../index");
var assert = require("assert");

var sampleLESS = __dirname + "/styles.less";
var sampleCSS = __dirname + "/styles.css";

var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var b = browserify(sampleLESS);
//b.add(sampleLESS);
//b.add(sampleCSS);
b.transform(lessify, {plugins: [autoprefix] });

b.bundle(function (err, src) {
	if (err) {
		console.error(err);
		assert.fail(err);
	}
	assert.ok(src);
	fs.writeFileSync(__dirname + "/bundle.js", src.toString());
});
