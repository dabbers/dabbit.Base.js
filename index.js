var fs = require('fs');
var path = require('path');

var projectRoot = path.dirname(process.argv[1]);

// Require some javascript prototpye global helpers

//require(path.join(projectRoot, "System", "Javascript", "g_StringExtensions"));
//require(path.join(projectRoot, "System", "Javascript", "g_ObjectExtensions"));


function requireall(basePath) {
	var curdir = path.join(__dirname, basePath, "/");
	
	var tmpexport = {};
	fs.readdirSync(curdir).forEach(function(file) {

		var fullPath = path.join(curdir, file);

		if (fs.statSync(fullPath).isDirectory()) {
			tmpexport[file] = requireall(path.join(basePath, file));
		}
		else if (file.indexOf(".js") == (file.length - ".js".length) && file !== 'index.js') {
			var name = file.replace('.js', '');
			var tmp = require(fullPath);

			if (file.indexOf("g_") == -1) {
				tmpexport[name] = tmp;
			}
		}
	});

	return tmpexport;
}

module.exports = requireall(".");