module.exports = function(grunt) {

	grunt.initConfig({
		shell: {
			
		},
		express: {
			dev: {
				options :{
					script: './lib/index.js'
				}
			}
		},
		
	});
	
	grunt.config( 'react', require('./grunt/react.js') );
	grunt.config( 'watch', require('./grunt/watch.js') );
	
	require('load-grunt-tasks')(grunt);
	
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('start', ['express:dev']);
	//grunt.registerTask('simpledocs', ['shell:snowlink','express:dev']);
	
}
