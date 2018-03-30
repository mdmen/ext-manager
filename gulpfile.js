const gulp = require("gulp");
const watch = require("gulp-watch");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const zip = require("gulp-zip");

const path = {
  dist: {
    js: "dist/js/",
    css: "dist/css/",
    img: "dist/img/",
    final: "final"
  },
  src: {
    js: "src/js/*.js",
    css: "src/css/*.css",
    img: "src/img/**/*.*"
  },
  watch: {
    js: "src/js/**/*.*",
    css: "src/css/**/*.*",
    img: "src/img/**/*.*"
  }
};

gulp
  .task("js:build", () => {
    return gulp
      .src(path.src.js)
      .pipe(plumber())
      .pipe(
        babel({
          presets: ["env"]
        })
      )
      .pipe(uglify())
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.js));
  })

  .task("css:build", () => {
    return gulp
      .src(path.src.css)
      .pipe(plumber())
      .pipe(
        autoprefixer({
          browsers: ["last 3 versions"],
          cascade: false
        })
      )
      .pipe(csso())
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.css));
  })

  .task("img:build", () => {
    return gulp
      .src(path.src.img)
      .pipe(plumber())
      .pipe(
        imagemin({
          progressive: true
        })
      )
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.dist.img));
  })

  .task("build", ["js:build", "css:build", "img:build"])

  .task("watch", () => {
    watch([path.watch.img], () => {
      gulp.start("img:build");
    });
    watch([path.watch.css], () => {
      gulp.start("css:build");
    });
    watch([path.watch.js], () => {
      gulp.start("js:build");
    });
  })
  // group needed files in one folder
  // and then create zip
  .task("final", () => {
    return Promise.all([
      new Promise(function(resolve, reject) {
        gulp
          .src(["./popup.html", "./manifest.json"])
          .pipe(gulp.dest(path.dist.final))
          .on("error", reject)
          .on("end", resolve);
      }),
      new Promise(function(resolve, reject) {
        gulp
          .src(["./dist/**/*.*", "!**/screenshot.png"])
          .pipe(gulp.dest(path.dist.final + "/dist"))
          .on("error", reject)
          .on("end", resolve);
      })
    ]).then(() => {
      gulp
        .src("./final/**/*.*")
        .pipe(zip("final.zip"))
        .pipe(gulp.dest("./"));
    });
  });
