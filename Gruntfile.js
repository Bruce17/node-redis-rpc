/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   21.04.2015 10:37
 */

/*eslint-disable */

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * Some basic information e.g. to create a banner
         */
        basicInformation: {
            author: 'Michael Raith <mia87@web.de>',
            url: 'https://github.com/Bruce17',
            date: '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'
        },

        banner: '/**\n' +
        ' * @author <%= basicInformation.author %>\n' +
        ' * @url    <%= basicInformation.url %>\n' +
        ' * @date   <%= basicInformation.date %>\n' +
        ' */\n',

        files: {
            js: [
                {
                    expand: true,
                    cwd: 'src/',
                    src: '**/*.js',
                    dest: 'lib/',
                    filter: 'isFile'
                }
            ],
            jsLib: [
                {
                    expand: true,
                    cwd: 'lib/',
                    src: '**/*.js',
                    dest: 'lib/',
                    filter: 'isFile'
                }
            ],
            test: [
                'test/**/*.spec.js'
            ]
        },


        /**
         * Do some code style checks.
         */
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: [
                'src/**/*.js'
            ]
        },


        /**
         * Copy files.
         */
        copy: {
            main: {
                files: '<%= files.js %>'
            }
        },


        /**
         * Remove console.logs statements.
         */
        removelogging: {
            main: {
                options: {
                    namespace: [
                        'console'
                    ],
                    methods: [
                        'log',
                        'info',
                        'warn',
                        'debug',
                        'error'
                    ],
                    replaceWith: ''
                },

                files: '<%= files.jsLib %>'
            }
        },


        /**
         * Add a banner to all created lib files.
         */
        usebanner: {
            main: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>',
                    linebreak: true
                },

                files: '<%= files.jsLib %>'
            }
        },


        /**
         * Test files
         */
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: [
                        'should'
                    ],
                    timeout: 20000 // 20 seconds
                },
                src: '<%= files.test %>'
            }
        }
    });

    grunt.registerTask('test', ['mochaTest:test']);

    // Default tasks
    grunt.registerTask('default', ['eslint', 'test', 'copy:main', 'removelogging:main', 'usebanner:main']);
};