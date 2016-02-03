var gulp 		= require('gulp');
var jbb 		= require('../index');

//
// Run test
//
gulp.task('default', function() {

	return gulp
		.src([
			'monster/bundle.json'
		])
		.pipe(jbb({
			'profile': 'three'
		}))
		.pipe(gulp.dest('build'));

});
