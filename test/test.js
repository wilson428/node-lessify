var fs = require("fs");
var browserify = require('browserify');
var lessify = require("../index");


var sampleLESS = __dirname + "/styles.less";
var sampleCSS = __dirname + "/styles.css";

var b = browserify();
b.add(sampleLESS);
b.add(sampleCSS);
b.transform(lessify);

b.bundle(function (err, src) {
	if (err) {
		throw err;
	}
	console.log("LESS and CSS scripts bundled. See " + __dirname + "/test.html");
	fs.writeFile(__dirname + "/bundle.js", src);
});
