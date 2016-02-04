var gulp 		= require('gulp');
var jbb 		= require('../index');

//
// Run test
//
gulp.task('default', function() {

	return gulp
		.src([
			'md2.jbbsrc'
		])
		.pipe(jbb({
			'profile': 'three'
		}))
		.pipe(gulp.dest('build'));

});
