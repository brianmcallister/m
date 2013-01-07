module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/m.jquery.js', 'src/m.valpatch.jquery.js'],
        dest: 'dist/m.jquery.min.js'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  // Run tests?
  grunt.registerTask('default', ['concat']);
};