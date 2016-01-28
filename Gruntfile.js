var path = require('path')


module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('./package.json'),

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    handlebars: {
      compile: {
        options: {

          // configure a namespace for your templates
          namespace: 'Templates',
          wrapped:true,
          // convert file path into a function name
          // in this example, I convert grab just the filename without the extension 
          processName: function(filePath) {
            var pieces = filePath.split('/');
            return pieces[pieces.length - 1].split('.')[0];
          }

        },

        // output file: input files
        files: {
          'public/templates/compiled.js': 'public/templates/*.hbs'
        }
      }
    },

    watch: {
      frontend: {
        files: [
          'public/templates/*.hbs',
          // '**/*.hbs',
          // 'main.js',
          // 'src/projects/*.js',
          // 'src/projects/projects.less',
          // 'src/core/*.js',
          // 'src/users/*.js',
          // 'src/users/*.less',
          // 'src/organizations/*.js',
          // 'src/organizations/*.less',
          // 'src/organizations/templates/*.hbs',
          // 'src/search/*.js',
          // 'src/search/*.less',
          // 'src/search/templates/*.hbs',
          // 'src/comments/*.less',
          // 'src/comments/*.js',
          // 'src/comments/templates/*.hbs',
          // 'src/widgets/templates/*.hbs',
          // 'src/widgets/widgets.js',
          // 'src/widgets/widgets.less',
          // 'src/nodes/templates/*.hbs',
          // 'src/nodes/*.js',
          // 'src/nodes/*.less'
        ],
        tasks: ['build:dev']
      }
    }
   })


  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-handlebars')
  grunt.loadNpmTasks('grunt-contrib-watch')


  grunt.registerTask('build:prod', ['less', 'browserify', 'handlebars', 'concat', 'tmplconfig', 'uglify'])
  grunt.registerTask('build:dev', ['handlebars', 'nodemon'])
}

