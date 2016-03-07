var fs = require('fs-extra');
var path = require('path');
var jade = require('jade');
var async = require('async');
var request = require('superagent');
var gulp = require('gulp'); 
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var rename = require('gulp-rename');
var jade = require('gulp-jade');
var ghpages = require('gh-pages');
var source = require('vinyl-source-stream');


/**
 * 
 * build a gitHub Pages site
 * 
 * 
 * */
module.exports = function() {
	var buildPath = this.get('build path ghpages');
	fs.ensureDirSync(buildPath);
	
	var indexHTML = path.join(buildPath, 'index.html');
	
	var tmp = this.get('build path tmp');
	
	// get the docs
	this.model.getPublished(function(err, docs) {
		if(err) {
			console.log(dashes, 'ERROR getting pages for ghpages build \n', err, dashes);
			return;
		}
		
		// request and save pages
		saveIndex();
		
		// build js pages
		
		
		// build html and json pages
		pages(docs);
		
		// copy assets
		
		
	});
	
}


function saveIndex() {
	// root
	var stream = fs.createWriteStream(indexHTML);
	var host = '@:' + this.keystone.get('port') + this._routes.exports.root;
	var req = request.get(host);
	req.pipe(stream);
	
	// bootstrap
	var stream = fs.createWriteStream(path.join(buildPath, 'bootstrap.html'));
	var host = '@:' + this.keystone.get('port') + this._routes.exports.bootstrap;
	var req = request.get(host);
	req.pipe(stream);
	
	// material
	var stream = fs.createWriteStream(path.join(buildPath, 'material.html'));
	var host = '@:' + this.keystone.get('port') + this._routes.exports.material;
	var req = request.get(host);
	req.pipe(stream);
	
}

function pages(docs) {
	var _this = this;
	
	docs.forEach(function(doc, k){
		var filename = doc.slug.replace(/\//g, '_');
		var jpath = (_this._routes.exports.page + filename).replace(/\//g, '_');
		var filepath = filename + '.html';
		var jsonpath =  jpath + '.json';
		fs.copy(indexHTML, path.join(buildPath, filepath), function (err) {
			if(err) {
				return console.error(err);
			}
			fs.copy(indexHTML, path.join(buildPath, jsonpath), function (err) {
				
			});
		});			
	});
}
