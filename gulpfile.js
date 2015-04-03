



var gulp = require("gulp");


gulp.task('hello',['imgcp'], function(){
	console.log('hello gulp');
});


gulp.task('imgcp', function(){
	return gulp.src('./workingFiles/intersecting.png')
		.pipe(gulp.dest('./gulptetstfolder'));
});

gulp.task('', function(){
	return gulp.src('./workingFiles/intersecting.png')
		.pipe(gulp.dest('./gulptetstfolder'));
});


gulp.task('default',['hello','imgcp']);