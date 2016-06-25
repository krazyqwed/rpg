var gulp  = require('gulp');
var fs    = require('fs');
var fse   = require('fs-extra');

var $ = {
    args         : require('yargs').argv,
    env          : require('dotenv').load({ path: './.env' }),
    gutil        : require('gulp-util'),
    rename       : require('gulp-rename'),
    if           : require('gulp-if'),
    sass         : require('gulp-sass'),
    autoprefixer : require('gulp-autoprefixer'),
    nano         : require('gulp-cssnano'),
    sourcemaps   : require('gulp-sourcemaps'),
    streamify    : require('gulp-streamify'),
    source       : require('vinyl-source-stream'),
    browserify   : require('browserify'),
    babelify     : require('babelify'),
    uglify       : require('gulp-uglify'),
    livereload   : require('gulp-livereload'),
    concat       : require('gulp-concat'),
    tap          : require('gulp-tap'),
}

if (typeof $.args.env != 'undefined') {
    var APP_ENV = $.args.env;
} else if (typeof process.env.APP_ENV != 'undefined') {
    var APP_ENV = process.env.APP_ENV;
} else {
    var APP_ENV = 'local';
}

var cssPath = './src/scss/';
var cssOutputPath = './dist/css/';

var jsPath = './src/app/';
var jsOutputPath = './dist/js/';

gulp.task('css', function() {
    return gulp.src(cssPath + '**/*.scss')
        .pipe($.if(APP_ENV != 'production', $.sourcemaps.init()))
        .pipe($.sass({ outputStyle: 'nested' }).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] }))
        .pipe($.if(APP_ENV == 'production', $.nano({ zindex: false })))
        .pipe($.if(APP_ENV != 'production', $.sourcemaps.write()))
        .pipe(gulp.dest(cssOutputPath));
});

gulp.task('cssConcat', ['css'], function() {
    return gulp.src([cssOutputPath + 'vendor/**/*.css', cssOutputPath + 'main.css'])
        .pipe($.concat('main.css'))
        .pipe(gulp.dest(cssOutputPath))
        .pipe($.livereload())
        .pipe($.tap(function(file, t) {
            $.gutil.log('Process CSS:', $.gutil.colors.green('✔ ') + file.path);
        })).on('end', function() {
            fse.removeSync(cssOutputPath + 'vendor');
        });
});

gulp.task('js', function() {
    return $.browserify({ debug: APP_ENV == 'production' ? false : true, extensions: ['.js'], fullPaths: APP_ENV != 'production' })
        .transform($.babelify, { presets: ['es2015'] })
        .require(jsPath + 'game.js', { entry: true })
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe($.source('game.js'))
        .pipe($.rename('app.js'))
        .pipe(gulp.dest(jsOutputPath));
});

gulp.task('jsConcat', ['js'], function() {
    return gulp.src([
            jsPath + 'vendor/pixi.min.js',
            jsPath + 'vendor/pixi-tilemap.js',
            jsPath + 'vendor/tween.min.js',
            jsPath + 'vendor/stats.min.js',
            jsPath + 'vendor/game-shim.js',
            jsOutputPath + 'app.js'
        ])
        .pipe($.concat('app.js'))
        .pipe($.if(APP_ENV == 'production', $.uglify({
            compress: {
                dead_code     : true,
                drop_debugger : true,
                global_defs   : {
                    'DEBUG': false
                }
            }
        })))
        .pipe(gulp.dest(jsOutputPath))
        .pipe($.livereload())
        .pipe($.tap(function(file, t) {
            $.gutil.log('Process JS:', $.gutil.colors.green('✔ ') + file.path);
        }));
});

gulp.task('watch', function() {
    $.livereload.listen();

    gulp.watch([cssPath + '**/*.scss'], ['cssConcat']);
    gulp.watch([jsPath + '**/*.js'], ['jsConcat']);
});

gulp.task('default', ['cssConcat', 'jsConcat']);
