// Generated on 2013-08-16 using generator-angular 0.3.1
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var path = require('path');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('grunt-express-server');

  // configurable paths
  var yeomanConfig = {
    app: './client',
    dist: './dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      test: {
        files: ['**/*.js'],
        tasks: ['express:dev'],
        options: {
          nospawn: true
        }
      },
      // livereload: {
      //   options: {
      //     livereload: LIVERELOAD_PORT
      //   },
      //   files: [
      //     '<%= yeoman.app %>/{,*/}*.html',
      //     '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
      //     '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
      //     '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
      //   ]
      // }
    },
    connect: {
      options: {
        port: 3007,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app),
              // mountFolder(connect, 'app'),
              require('./server/app.js')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{gif,webp}',
            'styles/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      }
    },
    concurrent: {
      target: {
        tasks: ['nodemon', 'karma:unit', 'watch', 'open'],
        options: {
          logConcurrentOutput: true
        }
      },
      server: {
        tasks: ['shell:start', 'shell:home', 'shell:create'],
        options: {
          logConcurrentOutput: true
        }
      },
      browse: {
        tasks: ['shell:home', 'shell:create'],
        options: {
          logConcurrentOutput: true
        }
      },
      phantom: {
        tasks: ['karma:phantomUnit','watch'],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    karma: {
      chrome: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome']
        // singleRun: false,
      },
      phantomUnit: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    express: {
      options: {
      // Override defaults here
      },
      dev: {
        options: {
          script: './server/app.js'
        }
      }
    },
    shell: {
      start: {
        command: 'npm start;sleep 3',
        options: {
          stdout: true
        }
      },
      sleep: {
        command: 'sleep 2'
      },
      home: {
        command: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --user-data-dir=tmp/tmp0 --window-size=800,600 --window-position=20,100 http://localhost:3000/'
      },
      create: {
        command: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --user-data-dir=tmp/tmp1 --window-size=800,600 --window-position=840,100 http://localhost:3000/#/create'
      }

    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      // 'clean:server',
      // 'concurrent:server',
      // 'connect:livereload',
      // 'concurrent:shell',
      // 'nodemon:dev',
      'watch'
    ]);
  });

  grunt.registerTask('double', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'express:dev',
      // 'concurrent:server',
      // 'shell:sleep',
      'concurrent:browse',
      'watch'
    ]);
  });

  grunt.registerTask('chrome', [
    'clean:server',
    'express:dev',
    'karma:chrome',
    'watch:test'
  ]);

  // run ```grunt phantom``` to use PhantomJS instead of Chrome debugger
  grunt.registerTask('phantom', [
    'clean:server',
    'express',
    'karma:phantomUnit',
    'watch:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'concat',
    'copy',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
