// v0.0.9a

var path = require("path");
var through = require('through2');
var less = require('less');
var assign = require('object-assign');

var func_start = "(function() { var head = document.getElementsByTagName('head')[0]; var style = document.createElement('style'); style.type = 'text/css';",
	func_end = "if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style);}())";

var defaultOptions = {
	compileOptions: {
		compress: true
	}
};

/*
you can pass options to the transform from your package.json file like so:

"browserify": {
	"transform-options": {
		"node-lessify": "textMode"
	}
}

NOTE: This is deprecated since it is now possible to do this like so:

"browserify": {
	"transform": [
		[ "node-lessify", { "textMode": true } ]
	]
}
*/

var currentWorkingDir = process.cwd();
var packageConfig;
try {
	packageConfig = require(currentWorkingDir + "/package.json");
} catch (e) {
	packageConfig = undefined;
}

/*
textMode simply compiles the LESS into a single string of CSS and passes it back without adding the
code that automatically appends that CSS to the page
*/

var packagePluginOptions = packageConfig &&
	packageConfig.browserify &&
	packageConfig.browserify["transform-packageConfig"] &&
	packageConfig.browserify["transform-packageConfig"]["node-lessify"];


module.exports = function (file, transformOptions) {
	if (!/\.css$|\.less$/.test(file)) {
		return through();
	}

	// set the curTransformOptions using the given plugin options
	var curTransformOptions = assign({}, defaultOptions, packagePluginOptions || {}, transformOptions || {});
	curTransformOptions._flags = undefined; // clear out the _flag property


	var buffer = "",
		myDirName = path.dirname(file);

	var compileOptions = assign({}, curTransformOptions.compileOptions || {});
	compileOptions.paths = [].concat(compileOptions.paths || [], [".", myDirName]);

	return through(write, end);

	function write(chunk, enc, next) {
		buffer += chunk.toString();
		next();
	}

	function end(done) {
		var self = this;

		// CSS is LESS so no need to check extension
		less.render(buffer, compileOptions).then(
			function(output) {
				// small hack to output the file path of the LESS source file
				// so that we can differentiate
				var compiled = JSON.stringify(
					output.css +
					(curTransformOptions.appendLessSourceUrl ?
					'/*# sourceURL=' + path.relative(currentWorkingDir, file).replace(/\\/g, '/') + ' */' : '')
				);

				if (curTransformOptions.textMode) {
					compiled = "module.exports = " + compiled + ";";
				} else {
					compiled = func_start + "var css = " + compiled + ";" + func_end;
				}

				self.push(compiled);
				self.push(null);

				// emit change event for watchers
				output.imports.forEach(function (f) {
					self.emit('file', f);
				});

				done();
			},
			function (err, output) {
				if (err) {
					var msg = err.message;
					if (err.line) {
						msg += " on " + err.line;
					}
					if (err.column) {
						msg += ":" + err.column;
					}
					if (err.extract) {
						msg += "\n" + err.extract + "\n";
					}

					done(new Error(msg, file, err.line));
					self.emit('file', err.filename);
				}


		});
	}
};
