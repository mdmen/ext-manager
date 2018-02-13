
const gulp = require('gulp');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');

const path = {
  dist: {
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
  },
  src: {
    js: 'src/js/*.js',
    css: 'src/css/*.css',
    img: 'src/img/**/*.*'
  },
  watch: {
    js: 'src/js/**/*.*',
    css: 'src/css/**/*.*',
    img: 'src/img/**/*.*'
  }
};

gulp
  .task('js:build', function () {
    return gulp.src(path.src.js)
      .pipe(plumber())
      .pipe(babel({
        presets: ['env']
      }))
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.js));
  })
  .task('css:build', function () {
    return gulp.src(path.src.css)
      .pipe(plumber())
      .pipe(autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false
      }))
      .pipe(csso())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.css));
  })
  .task('img:build', function () {
    return gulp.src(path.src.img)
      .pipe(plumber())
      .pipe(imagemin({
        progressive: true
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.img));
  })
  .task('build', [
    'js:build',
    'css:build',
    'img:build',
  ])
  .task('watch', function () {
    watch([path.watch.img], function (e, cb) {
      gulp.start('img:build');
    });
    watch([path.watch.css], function (e, cb) {
      gulp.start('css:build');
    });
    watch([path.watch.js], function (e, cb) {
      gulp.start('js:build');
    });
  });
