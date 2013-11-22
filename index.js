var less = require('less');
var cleanCSS = require('clean-css');
var through = require('through');

var parser = new(less.Parser)({
	paths: [__dirname, __dirname + "/test"],
	syncImport: true
});

var func_start = "(function() { var head = document.getElementsByTagName('head')[0]; style = document.createElement('style'); style.type = 'text/css';";
var func_end = "if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style);}())"; 

module.exports = function(file) {
	if (!/\.css|\.less/.test(file)) {
		return through();
	}
	var buffer = "";

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

		var compiled = cleanCSS.process(compiled);

		compiled = func_start + "var css = \"" + compiled.replace(/'/g, "\\'").replace(/"/g, '\\"') + "\";" + func_end;
		this.queue(compiled);
		return this.queue(null);
	});
};