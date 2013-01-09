// TODO - Figure out how to make a banner task or something that will apply
// the banner to ALL the files.
var banner = '/*!' +
  '\n\t<%= pkg.name %>: <%= pkg.description %>' +
  '\n\t<%= pkg.author %> • http://brianmcallister.com' +
  '\n\n\tThis build: v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>' +
  '\n*/\n';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // Clean task.
    clean: {
      dist: ['dist']
    },
    
    // Concat task.
    concat: {
      options: {
        banner: banner
      },
      dist: {
        src: 'src/*.js',
        dest: 'dist/m.jquery-patched.js'
      }
    },
    
    // Uglify task.
    uglify: {
      options: {
        banner: banner
      },
      dist: {
        files: {
          'dist/m.jquery.min.js': 'dist/m.jquery.js',
          'dist/m.jquery-patched.min.js': 'dist/m.jquery-patched.js'
        }
      }
    },
    
    // Copy task.
    copy: {
      dist: {
        files: {
          'dist/m.jquery.js': 'src/m.jquery.js'
        }
      }
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  // Build task.
  grunt.registerTask('build', 'Build the plugin files.', [
    'clean', 'concat', 'copy', 'uglify'
  ]);
  
  // Run tests?
  grunt.registerTask('default', ['build']);
};