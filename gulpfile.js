var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs-extra');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var literalify = require('literalify');
var rename = require('gulp-rename');
var concat = require('gulp-concat')
var source = require('vinyl-source-stream');
var shim = require('browserify-global-shim');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
//var packages = require('./public/client/packages');
var _ = require('lodash');
var pm2 = require('pm2');
var Builder = require('systemjs-builder');
var gutil = require('gulp-util');
var jspm = require('gulp-jspm-build');

/**
 * Build Tasks
 */
 
// bundle all dependencies
// see app/app/app.js to use
gulp.task('bundle',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.bundle('app/app - [app/**/*]', './app/bundles/dependencies.js', { minify: true, sourceMaps: false })
	.then(function() {
		gutil.log('wrote /bundles/dependencies.js');
		builder.reset()
		cb()
	})
	.catch(function(err) {
		gutil.log('FAILED dep bundle ',err)
		cb()
	});
});
 
// bundle all dependencies
// see app/app/app.js to use
gulp.task('bundle-client',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.bundle('app/app - dependencies', './app/bundles/client.js', { minify: false, sourceMaps: true })
	.then(function() {
		gutil.log('wrote /bundles/client.js');
		builder.reset()
		cb()
	})
	.catch(function(err) {
		gutil.log('FAILED dep bundle ',err)
		cb()
	});
});
gulp.task('production-build',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.buildStatic('app/app', './public/js/bundles/material-system.js', { minify: true, sourceMaps: false })
	.then(function() {
		gulp.src([
			'public/js/lib/jquery/jquery-2.1.1.min.js', 
			'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
			'public/js/user-code.js',
			'public/js/lib/prism.js',
			'public/js/bundles/material-system.js',
			
		])
		.pipe(concat('material-ui.js'))
		.pipe(gulp.dest('public/js/bundles'))
		.on('end', function() {
			gutil.log('wrote /js/material-ui.js');
			fs.remove('./public/js/bundles/material-system.js', function (err) {
				if (err) {
					return console.error(err)
				}
			})
			cb();
		});
	})
	.catch(function(err) {
		gutil.log('FAILED dep bundle ',err)
		cb()
	});
});
gulp.task('bundle-production',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.bundle('app/app', './app/bundles/production.js', { minify: true, sourceMaps: false })
	.then(function() {
		gutil.log('wrote /bundles/production.js');
		builder.reset()
		cb()
	})
	.catch(function(err) {
		gutil.log('FAILED dep bundle ',err)
		cb()
	});
});

gulp.task('vendor', function() {
	
	gulp.src([
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
    ])
    .pipe(concat('vendor2.js'))
    .pipe(gulp.dest('public/js/bundles'));
    
	return gulp.src([
		'public/js/lib/snowbug.js',
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/lib/bone.io/bone.io.min.js',
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/js/bundles'))
});

gulp.task('package', function() {
	
	gulp.src([
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/user-code.js',
		'public/js/lib/prism.js',
		'app/jspm_packages/system.js',
		'app/app.js'
    ])
    .pipe(concat('material-ui.js'))
    .pipe(gulp.dest('public/js/bundles'));
    
	return gulp.src([
		'public/js/lib/snowbug.js',
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/lib/bone.io/bone.io.min.js',
		'public/js/config.js',
		'public/js/comms.js',
		'public/js/user-code.js',
		'public/js/lib/prism.js',
		'public/js/lib/react/build/simpledocs.js',
    ])
    .pipe(concat('bootstrap-ui.js'))
    .pipe(gulp.dest('public/js/bundles'))
});

gulp.task('package-dev', function() {
	
	gulp.src([
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/user-code.js',
		'public/js/lib/prism.js',
		'app/jspm_packages/system.js',
		'app/app.js'
    ])
    .pipe(concat('material-ui-dev.js'))
    .pipe(gulp.dest('public/js/bundles'));
    
	return gulp.src([
		'public/js/lib/snowbug.js',
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/lib/bone.io/bone.io.min.js',
		'public/js/config.js',
		'public/js/comms.js',
		'public/js/user-code.js',
		'public/js/lib/prism.js',
		'public/js/lib/react/build/simpledocs.js',
    ])
    .pipe(concat('bootstrap-ui.js'))
    .pipe(gulp.dest('public/js/bundles'))
});

gulp.task('scripts', function(){
	var b = browserify();
	packages.forEach(function(i) {
		if(_.isObject(i)) i = i.opts.expose;
		if(i) b.exclude(i);
	});
	b.transform(reactify); // use the reactify transform
	b.add('client/app.js');
	return b.bundle()
				.pipe(source('client.js'))
				.pipe(gulp.dest('public/js'));
});

gulp.task('bootstrap', function(){
	var b = browserify();
	//b.transform([reactify, globalShim]); // use the reactify transform
	b.transform("babelify", {presets: ["es2015", "react"]})
	b.add('public/js/lib/react/jsx/simpledocs.js');
	return b.bundle()
				.pipe(source('simpledocs.js'))
				.pipe(gulp.dest('public/js/lib/react/build'));
});

gulp.task('pm2', function(cb) {
  pm2.connect(function() {
    pm2.restart('test', function() { 
      return cb()
    })
  })
})


// Watch
gulp.task('watch', function() {
  gulp.watch('app/app/**', ['bundle-client'])
})

gulp.task('watch-bootstrap', function() {
  gulp.watch('public/js/lib/react/jsx/**', ['bootstrap'])
})
gulp.task('watch-package', function() {
  gulp.watch(['public/js/lib/react/build/**', 'app/app/**'], ['package-dev'])
})

gulp.task('default', [ 'scripts', 'vendor'])
