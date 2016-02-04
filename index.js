/**
 * gulp-jbb - Javascript Binary Bundles - Gulp Compiler
 * Copyright (C) 2015 Ioannis Charalampidis <ioannis.charalampidis@cern.ch>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Ioannis Charalampidis / https://github.com/wavesoft
 */

var through2 		= require('through2');
var gutil 			= require('gulp-util');
var PluginError 	= gutil.PluginError;
var temp 			= require("temp").track();
var toArray  		= require('stream-to-array');
var fs   			= require('fs');
var path 			= require('path');
var JBBCompiler		= require("jbb/compiler");

const PLUGIN_NAME 	= 'gulp-jbb';

/**
 * Read resulting bundle and return a stream with it
 */
function streamOutput( callback ) {
	return function(err, filename) {
		if (err) {
			callback(err, null);
		} else {
			callback(err, fs.createReadStream(filename));
		}
	}
}

/**
 * Parse input file as buffer and return the JSON-parsed string
 */
function processAsBuffer( file ) {
	return function( callback ) {
		var json = JSON.parse(file.contents);
		callback( json, path.dirname(file.path) );
	}
}

/**
 * Parse input file as stream and return the JSON-parsed string
 */
function processAsStream( file ) {
	return function( callback ) {
		var json = JSON.parse(file.contents);
		callback( json, path.dirname(file.path) );
	}
}

/**
 * Helper function to compile the JBB bundle according to 
 * the configuration options and return the temporary filename
 * were the bundle was created.
 */
function compileJBB( config, parseCallback, resultCallback ) {

	// Continue compiling the JBB bundle
	var compile = function( bundleJSON, bundlePath, tempName ) {

		// Update path in config
		if (!config['path'])
			config['path'] = path.dirname(bundlePath);

		// Create the JBB bundle
		JBBCompiler.compile(
				bundleJSON,
				tempName,
				config,
				function() {

					// Trigger callback
					resultCallback( null, tempName );

				}
			);

	};

	// Open a new temporary file (to be tracked by temp)
	temp.open({suffix: '.jbb'}, function(err, info) {

		// Handle errors
		if (err) {
			resultCallback(err, null);
			return;
		}
	    fs.close(info.fd, function(err) {
	      if (err) {
			resultCallback(err, null);
			return;
	      }

	      // We are ready, continue with compiling
	      parseCallback(function( bundleJSON, baseName ) {
		      compile( bundleJSON, baseName, info.path );
	      });
	    });

	});

}

/**
 * Interface to Gulp
 */
module.exports = function( options ) {

	// Combine user defined options with default options
	var config = { };
	for (var attrname in options) { config[attrname] = options[attrname]; }

	// Create a through2 object stream. This is our plugin export
	var stream = through2.obj(compile);

	// Expose the config so we can test it
	stream.config = config;

	function compile(originalFile, enc, done) {
		var self = this;

	    // Call when finished with compression
	    var finished = function( err, contents ) {
	    	// Replace file contents
			originalFile.contents = contents;

			// Change extension
			var path = originalFile.path;
			var parts = path.split("."); parts.pop();
			originalFile.path =  parts.join(".") + ".jbb";

			// Pass along the new file
			self.push(originalFile);
			done();
			return;
	    }

		// Compile and wrap results accordingly
		fs.readFile(originalFile.path + "/bundle.json", 'utf8', function (err,data) {

			// Raise errors in case there is something wrong
			if (err) {
				var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
				self.emit('error', error);
				done();
				return;
			} 

			// Compile JBB using the bundle contents
			compileJBB( config, processAsBuffer({
				'contents': data,
				'path': originalFile.path + "/bundle.json"
			}), streamOutput( finished ) );

		});
		// if (file.isBuffer()) {
		// 	compileJBB( config, processAsBuffer(file), streamOutput( finished ) );
		// } else {
		//  compileJBB( config, processAsStream(file), streamOutput( finished ) );
		// }

	}

	return stream;
}
