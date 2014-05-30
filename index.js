// v0.0.4

var less = require('less');
var CleanCSS = require('clean-css');
var through = require('through');
var path = require("path");

var textMode = false,
	func_start = "(function() { var head = document.getElementsByTagName('head')[0]; style = document.createElement('style'); style.type = 'text/css';",
	func_end = "if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style);}())"; 

try {
	var options = require(process.cwd() + "/package.json");
} catch (e) {
	var options = {};
};

if (options.browserify && options.browserify["transform-options"] && options.browserify["transform-options"]["node-lessify"] == "textMode") {
	textMode = true;
}

module.exports = function(file) {
	if (!/\.css$|\.less$/.test(file)) {
		return through();
	}
	var buffer = "",
		mydirName = path.dirname(file);

	var parser = new(less.Parser)({
		paths: [mydirName, __dirname],
		syncImport: true
	});

	return through(function(chunk) {
    	return buffer += chunk.toString();
  	}, function() {

  		var compiled;

  		// CSS is LESS so no need to check extension
		parser.parse(buffer, function(e, r) { 
			compiled = r.toCSS();
		});

		// rv comments
		// http://stackoverflow.com/questions/5989315/regex-for-match-replacing-javascript-comments-both-multiline-and-inline
		compiled = compiled.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, "");

		var compiled = CleanCSS().minify(compiled);

		if (textMode) {
            compiled = "module.exports = \"" + compiled.replace(/'/g, "\\'").replace(/"/g, '\\"') + "\";";
		} else {
			compiled = func_start + "var css = \"" + compiled.replace(/'/g, "\\'").replace(/"/g, '\\"') + "\";" + func_end;
		}
		this.queue(compiled);
		return this.queue(null);
	});
};