module.exports = {
	jsx: {
		files: [{
			expand: true,
			cwd: 'public/js/lib/react/jsx',
			src: ['**/*.jsx','**/*.js'],
			dest: 'public/js/lib/react/build/',
			ext: '.js'
		}]
	}
}
