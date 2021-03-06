/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path  = require('path'),
    gulp  = require('gulp'),
    log   = require('gulp-util').log,
    load  = require('require-nocache')(module),
    cfg   = path.join(process.env.PATH_ROOT, process.env.PATH_CFG, 'weinre'),
    app   = require('spasdk/lib/app'),
    title = 'weinre  ';


// task set was turned off in gulp.js
// if ( !config ) {
//     // do not create tasks
//     return;
// }


// start or restart service
gulp.task('weinre', function ( done ) {
    var config  = load(cfg),
        msg     = 'http://' + app.host + ':' + config.port + '/client/#anonymous',
        hash    = new Array(msg.length + 1).join('-'),
        isReady = false,
        spawn, weinre;

    if ( !config.active ) {
        // just exit
        log(title, 'task is disabled');

        done();
    }

    // prepare
    spawn = require('child_process').spawn;

    //TODO: make it work on Windows
    weinre = spawn(path.join(process.env.PATH_ROOT, 'node_modules', '.bin', 'weinre'), [
        '--httpPort',  config.port,
        '--boundHost', config.host,
        '--verbose',   config.logging.toString(),
        '--debug',     config.logging.toString()
    ]);

    weinre.on('exit', function () {
        log(title, 'process terminated');

        done();
    });

    weinre.on('error', function () {
        log(title, 'FATAL ERROR', '(check weinre is installed)');
    });

    weinre.stderr.on('data', function ( data ) {
        log(title, data.toString().trim());
    });

    weinre.stdout.on('data', function ( data ) {
        if ( isReady ) {
            data.toString().trim().split('\n').forEach(function ( line ) {
                log(title, line.trim().split(' weinre: ').pop());
            });
        } else {
            // first invoke
            isReady = true;

            log(title, hash);
            log(title, 'WEb INspector REmote is ready!');
            log(title, msg);
            log(title, hash);
        }
    });

    // make sure to stop it
    process.on('exit', function () {
        weinre.kill();
    });
});
