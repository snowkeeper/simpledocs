var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var literalify = require('literalify');
var rename = require('gulp-rename');
var concat = require('gulp-concat')
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
//var packages = require('./public/client/packages');
var _ = require('lodash');
var pm2 = require('pm2');
var Builder = require('systemjs-builder');
var gutil = require('gulp-util');


/**
 * Build Tasks
 */
 
// bundle all dependencies
// see public/app.js to use
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


// bundle worker dependencies
gulp.task('bundle-worker',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.bundle('app/common/workers/guideData - [app/**/*]', './app/bundles/worker-dependencies.js', { minify: true, sourceMaps: false })
	.then(function() {
		gutil.log('wrote /bundles/worker-dependencies.js');
		builder.reset()
		cb()
	})
	.catch(function(err) {
		gutil.log('FAILED dep bundle ',err)
		cb()
	});
});
 
// bundle all dependencies
// see public/app.js to use
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
gulp.task('dev-bundle',  function (cb) {
	var builder = new Builder('./app', './app/config.js');
	builder.bundle('app/app - [app/**/*]', './app/bundles/dependencies.js', { minify: false, sourceMaps: true })
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


gulp.task('vendor', function() {
	
	var b = browserify();
	packages.forEach(function(i) { 
		if(_.isObject(i)) {
			b.require(i.file,i.opts);
		} else {
			b.require(i);
		}
	});
	b = b.bundle().pipe(source('packages.js'));
	if (process.env.NODE_ENV === 'production') {
		b.pipe(streamify(uglify()));
	}
	gulp.src([
		'public/js/lib/jquery/jquery-2.1.1.min.js', 
		'public/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/js/lib/socket.io/socket.io.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/js'))
	return b.pipe(gulp.dest('public/js'));
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

//see below for some links about programmatic pm2
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

gulp.task('default', [ 'scripts', 'vendor'])