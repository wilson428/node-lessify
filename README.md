node-lessify
============
Version 0.1.4

[![Build Status](https://travis-ci.org/wilson428/node-lessify.png)](https://travis-ci.org/wilson428/node-lessify)
[![Dependency Status](https://david-dm.org/wilson428/node-lessify.svg)](https://david-dm.org/wilson428/node-lessify)
[![devDependencies](https://david-dm.org/wilson428/node-lessify/dev-status.svg)](https://david-dm.org/wilson428/node-lessify#info=devDependencies)

LESS 2.0 precompiler and CSS plugin for Browserify. Inspired by [node-underscorify](https://github.com/maxparm/node-underscorify).

When bundling an app using [Browserify](http://browserify.org/), it's often convenient to be able to include your CSS as a script that appends the style declarations to the head. This is particularly relevant for self-assembling apps that attach themselves to a page but otherwise have reserved real-estate on the DOM.

This small script allows you to `require()` your CSS or LESS files as you would any other script.

## Installation

```
npm install node-lessify
```

## Usage
Write your LESS or CSS files as you normally would, and put them somewhere where your script can find it.

Then simply require them as you might anything else:

```
require('./styles.less');
require('./mysite.css');
```

To compile the stylesheets, pass this module to browserify as a transformation on the command line.

```
browserify -t node-lessify script.js > bundle.js
```

## How it works

The stylesheets are compiled (in the case of LESS), minified, and bundle into a function that creates a new `<style>` element and appends it to the `<head>` using [native Javascript](http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript).

## Imports
LESS allows one to ```@import``` other LESS files. This module synchronously imports those dependencies at the time of the bundling. It looks for the imported files in both the directory of the parent file and the folder where the module itself lives, so it should work so long as the paths in the ```@import``` commands are correct relative to the importing file, as usual. It is not currently tested for recursive importing.

## Options

### Text Mode
[As requested](https://github.com/wilson428/node-lessify/issues/1), it is now possible to ask the transformation not to auto-append the css but merely to compile it into a string and assign it to a variable. This is accomplished by adding a `package.json` file in the directory from which browserify is run with the following properties:

    "browserify": {
        "transform": [
            [ "node-lessify", {"textMode": true } ]
        ]
    }

See the dummy app in the [test directory](/test) for an example of this in action.

### Append Less file source URL
As a workaround to LESS source map issues (e.g. css style lines not referring to the correct LESS file), we can output
 only the source LESS file name for each require() call of a LESS file. This will at least allow us to distinguish
 STYLE elements.

### Plugins
You can pass a `plugins` argument to get less plugins like [autoprefix](https://www.npmjs.com/package/less-plugin-autoprefix):

For example (from [test.js](test/test.js)):

	var LessPluginAutoPrefix = require('less-plugin-autoprefix');
	var autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

	var b = browserify(sampleLESS);
	b.transform(lessify, {
		compileOptions: {
			plugins: [autoprefix]
		}
	});

Note: This does not currently work via `package.json` arguments, since the plugins need to be required separately, but we're working on it.

### Global Paths
Pass a `globalPaths` option to append search paths to `less.render`.  These paths will be searched for any `@import` calls.

	var b = browserify(sampleLESS);
	b.transform(lessify, {
		globalPaths: {
			paths: [`${__dirname}/myproject/src/globals`],
		}
	});

So we can now just do simple includes in any of our less files

`src/my/really/long/path/file.less`:

	@import colors.less; // Will look for myproject/src/globals/colors.less



## Changes
**v0.1.3, v0.1.4**: Added badges

**v0.1.2**: Updated dependencies

**v0.1.1**: Updated dependencies

**v0.0.11**: Watchify support. Thx, @jiaweihli!

**v0.0.10**: Supports backslashes in CSS. Thx, @BernieSumption!

**v0.0.9b**: README fixes

**v0.0.9a**: Allow for less plugins. Thx @henriklundgren!

**v0.0.9**: Read options from package.json the correct way, now that [Browserify allows for it](https://github.com/substack/node-browserify#btransformtr-opts).

**v0.0.8**: More useful error statements with line and column numbers

**v0.0.7**: Now throws an error instead of failing silently if there's bad LESS, per [Issue #8](https://github.com/wilson428/node-lessify/issues/8)
