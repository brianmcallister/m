module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: 'src/*.js',
        dest: 'dist/m.jquery.js'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  // Run tests?
  grunt.registerTask('default', ['concat']);
  
  
  grunt.registerTask('build', 'Build the plugin files.', ['concat']);
};