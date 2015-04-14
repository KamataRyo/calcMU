



var gulp = require("gulp");
var mocha = require("gulp-mocha");

gulp.task('mocha', function(){
	return gulp.src(['test/geoAnalysis.test.js'],{read : false})
	.pipe(mocha({reporter : 'nyan'}))
});


gulp.task('watch',function(){
	gulp.watch(['./js/*.js','./test/*.test.js'],['default']);
});


gulp.task('default', ['mocha']);