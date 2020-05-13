"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var imageminJpegtran = require('imagemin-jpegtran');

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(gulp.dest("build/js"));
});

gulp.task("fonts", function () {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"));
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imageminJpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});


gulp.task("min_css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("min_css"));
  gulp.watch("source/fonts/**/*.{woff,woff2}", gulp.series("fonts"));
  gulp.watch("build/fonts/*.woff,woff2").on("change", server.reload);
  gulp.watch("source/js/**/*.js", gulp.series("js"));
  gulp.watch("build/js/*.js").on("change", server.reload);
  gulp.watch("source/img/**/*.*", gulp.series("images"));
  gulp.watch("build/img/*.*").on("change", server.reload);
  gulp.watch("source/*.html", gulp.series("html"));
  gulp.watch("build/*.html").on("change", server.reload);
});

gulp.task("build", gulp.series("html", "images", "js", "fonts", "min_css", "css"));
gulp.task("start", gulp.series("build", "server"));

