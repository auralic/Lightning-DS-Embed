module.exports = function(grunt) {
	var gtx = require('gruntfile-gtx').wrap(grunt);

    gtx.loadAuto();

    var gruntConfig = require('./grunt');
    gruntConfig.package = require('./package.json');

    gtx.config(gruntConfig);

    // We need our bower components in order to develop
    gtx.alias('build:angular', [
        'recess:less', 
        'clean:angular', 
        'copy:libs', 
        'copy:angular',
        'bake',
        'useminPrepare', 
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'usemin',
        'clean:tmp'
    ]);

    gtx.alias('build:watch', [
        'watch:all'
    ]);

    gtx.finalise();
}
