var
	gulp = require('gulp'), // Сообственно Gulp JS
	connect = require('gulp-connect');

gulp.task('livereload', function(){
	gulp.src(['*.css', '*.js'])
	.pipe(
		connect.reload()
	);
});

// Локальный сервер для разработки
gulp.task('http-server', function() {
	connect.server({
			root: './',
			port: 4000,
			livereload: true/*,
			'livereload.port': 4001*/
		});

	console.log('Server listening on http://localhost:4000');
});

gulp.task('watch', function() {
	gulp.run('http-server');
	gulp.watch('*.css', ['livereload']);
	gulp.watch('*.js', ['livereload']);
	gulp.watch('*.html', ['livereload']);
});

gulp.task('default', function(){
	gulp.run('watch');
});