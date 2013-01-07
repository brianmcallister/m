module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // Concat task.
    concat: {
      dist: {
        src: 'src/*.js',
        dest: 'dist/m.jquery-patched.js'
      }
    },
    
    // Copy task.
    copy: {
      dist: {
        files: {
          'dist/m.jquery.js': 'src/m.jquery.js'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  // Run tests?
  grunt.registerTask('default', ['concat']);
  
  
  grunt.registerTask('build', 'Build the plugin files.', ['concat', 'copy']);
};