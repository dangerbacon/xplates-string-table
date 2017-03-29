var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var insert = require('gulp-insert');

//Build is only task
gulp.task('default', function()
{
  //Read package
  var pack = require('./package.json');
  
  //Header
  var header = 
    "/** XPlatesStringTable version " + pack.version + "\n" +
    "  * @license " + pack.license + "\n" + 
    "  * @preserve \n **/\n";  
  
  //Read
  var ops = { };
  gulp.src('lib/xplates-string-table.js').pipe(uglify(ops)).pipe(insert.prepend(header)).pipe(rename('xplates-string-table.'+pack.version+'.min.js')).pipe(gulp.dest('dist'));
  gulp.src('lib/xplates-string-table.js')                  .pipe(insert.prepend(header)).pipe(rename('xplates-string-table.'+pack.version+'.js'    )).pipe(gulp.dest('dist'));
});