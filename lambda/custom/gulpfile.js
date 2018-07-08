'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

// task to run es lint.
gulp.task('lint', () =>
  gulp.src(['*.js', '*/**/*.js', '!test/**', '!build/**', '!node_modules/**', '!ext/**'])
    .pipe(eslint())
    .pipe(eslint.format())
);

gulp.task('clean', () => {
  return del(['build/']);
});

gulp.task('build', ['clean', 'lint']);
gulp.task('default', ['lint']);
