node-lessify
============

"!https://travis-ci.org/wilson428/node-lessify.png!":https://travis-ci.org/wilson428/node-lessify

LESS precompiler and CSS plugin for Browserify v2. Inspired by [node-underscorify](https://github.com/maxparm/node-underscorify).

When bundling an app using [Browserify](http://browserify.org/), it's often convenient to be able to include your CSS as a script that appends the style declarations to the head. This is particularly relevant for self-assembling apps that attach themselves to a page but otherwise have reserved real-estate on the DOM.

This small script allows you to `require()` your CSS or LESS files as you would any other script.

## Usage
Write your LESS or CSS files as you normally would, and put them somewhere where your script can find it.

Then simply require them as you might anything else:

```
require('./styles.less');
require('./mysite.css');
```

To compile the stylesheets, pass this module to browserify as a transformation on the command line.

`browserify -t node-lessify script.js > bundle.js`

## How it works

The stylesheets are compiled (in the case of LESS), minified, and bundle into a function that creates a new `<style>` element and appends it to the `<head>` using [native Javascript](http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript).