/**
 * wizardry - A task-based library for graphicsmagick.
 *
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this 
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under 
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF 
 * ANY KIND, either express or implied. See the License for the specific language 
 * governing permissions and limitations under the License.
 *
 * @package wizardry
 * @author Zachary Bruggeman <zbruggeman@me.com>
 */

/**
 * Dependencies (Wizard Textbooks)
 */
var _     = require('lodash'),
    async = require('async'),
    spawn = require('child_process').spawn;

var env = Object.create(null);

/**
 * Export (Expecto Patronum)
 *
 * @param {Array} Array of image paths
 * @param {Object} Processing task to run
 * @param {Function} Callback to be ran after finished processing
 *
 * @return {Error}
 */

module.exports = function (images, task, callback) {

    var args = [];
    var command;

    var cpu = task.processes ? task.processes : require('os').cpus().length;

    _.defaults(env, {
        cpu: cpu
    });

    if (task.library === 'graphicsmagick') {
        command = 'gm';
    } else if (task.library === 'imagemagick') {
        command = 'mogrify'
    } else {
        if (task.library) {
            return callback('Error: Unknown library!');
        } else {
            command = 'gm';
        } 
    };

    if (command === 'gm') {
      if(task.composite){
        args.push('composite');

      }
      else
        args.push('mogrify');
    };

    if (task.outputDirectory) {
        if (command === 'gm') {
            args.push('-output-directory ' + task.outputDirectory);
        } else {
            args.push('-path ' + task.outputDirectory);
        };
    };

    _.each(task.commands, function(arguments, com) {
        args.push('-' + com);
        args.push(arguments);
    });



    var queue = async.queue(function (filename, callback) {
        var args_processed = args.slice(0);
        args_processed.push(filename);
      if(task.composite)
      {
        args_processed.push(task.baseimage);

        args_processed.push(task.outputimage);
      }
        console.log(command);
        console.log(args_processed);
        var process = spawn(command, args_processed);
        process.on('exit', function (code) {
            if (code !== 0) return callback('Process ended with signal ' + code);
            callback();
        });
    }, env.cpu);

    queue.push(images);

    queue.drain = callback;
};
