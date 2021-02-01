module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    eslint: {
      target: [
        'Gruntfile.js',
        'app/*.js',
        'server.js',
        'testSetup.js',
        '__tests__/**/*.js'
      ]
    },
    watch: {
      files: [
        'Gruntfile.js',
        'app/*.js',
        'server.js',
        'testSetup.js',
        '__tests__/**/*.js'
      ],
      tasks: ['eslint']
    }
  });
  grunt.registerTask('lint', ['eslint']);
};