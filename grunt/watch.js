module.exports = {
  less: {
	  files: ['src/css/less/*.less'],
	  tasks: [
	  'recess',
	  'useminPrepare', 
	    'concat:generated',
	    'cssmin:generated',
	    'uglify:generated',
	    'usemin',
	    'clean:tmp'
	  ],
  },
  js : {
  	files: ['src/js/**/*.js'],
	tasks: [
	'copy:angular',
	'useminPrepare', 
	    'concat:generated',
	    'cssmin:generated',
	    'uglify:generated',
	    'usemin',
	    'clean:tmp'
	]
  },
  html : {
  	files: ['src/tpl/**/*.html'],
	tasks: [
	'copy:angular',
	  'useminPrepare', 
	    'concat:generated',
	    'cssmin:generated',
	    'uglify:generated',
	    'usemin',
	    'clean:tmp'
	]
  },
  all : {
  	files: ['src/css/less/*.less', 'src/js/**/*.js', 'src/tpl/**/*.html'],
	tasks: [
	  'recess',
	  'copy:angular',
	  'useminPrepare', 
	    'concat:generated',
	    'cssmin:generated',
	    'uglify:generated',
	    'usemin',
	    'clean:tmp'
	  ],
  }
}
