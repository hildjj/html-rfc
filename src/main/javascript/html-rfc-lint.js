var fs = require('fs');

var lint = function(nitdir) {

    // TODO Windows support
    var pathsep = '/';

    fs.readdir(nitdir, function(err, files) {
        if (err) {
            console.log('Argh! Errors!');
            console.log(err);
            process.exit(-2);
        } else {
            // capture the start time so it's the same for all nits
            var environment = {};
            Object.defineProperty(environment, 'timestamp', { value: new Date() });

            files.forEach(function(nitFile) { 
                // only run js files -- allows README.md etc.
                if (!nitFile.match(/.*\.js$/))
                    return;

                var nit = require(fs.realpathSync(nitdir + pathsep + nitFile));
                var result = nit.nit(environment);
                var result = null;
                if (result) {
                    console.log('Error while running through ' + nitFile + '!');
                    console.log(result);
                    process.exit(-3);
                }
            });
        }
    });
};

var cmdlineInvoke = function() {
    console.log('IETF RFC Lint for HTML');

    var nitdir;
    if (process.argv.length == 2) {
        var basedir = process.mainModule.filename.replace(/(^.*[\/\\])[^\/\\]*/, '$1');
        nitdir = basedir + 'nits';
    } else if (process.argv.length == 3) {
        nitdir = process.argv[2];
    } else {
        stderr('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [nitdir]');
        process.exit(-1);
    }

    lint(nitdir);
};

cmdlineInvoke();