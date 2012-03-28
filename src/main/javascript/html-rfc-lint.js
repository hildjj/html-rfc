var fs = require('fs');
var jsdom = require('jsdom');

var runNits = function(environment, nitDir, files, onSuccess) {
    // TODO Windows support
    var pathsep = '/';

    var nitHelper = function(environment, nitDir, files, index) {
        if (index >= files.length) {
            onSuccess();
            return;
        }

        var nitFile = files[index];

        var next = function() {
            nitHelper(environment, nitDir, files, index+1)
        };

        // only run js files -- allows README.md etc.
        if (!nitFile.match(/.*\.js$/)) {
            next();
        } else {
            nitFile = fs.realpathSync(nitDir + pathsep + nitFile);
            var nit = require(nitFile);
            nit.nit(environment, next);
        }
    };
    nitHelper(environment, nitDir, files, 0);
};

var writeOutput = function(document, outputFile) {
    var output = document.innerHTML;

    if (outputFile == '-')
        process.stdout.write(output);
    else
        fs.writeFileSync(outputFile, output);
};

var lint = function(nitDir, inputFile, outputFile) {

    fs.readdir(nitDir, function(err, files) {
        if (err) {
            process.stderr.write('Argh! Errors!\n');
            process.stderr.write(err + '\n');
            process.exit(-2);
        } else {
            // capture the start time so it's the same for all nits
            var environment = {};
            Object.defineProperty(environment, 'timestamp', {
                value: new Date(), 
                enumerable: true
            });

            var input = fs.readFileSync(inputFile);
            var document = jsdom.jsdom(input);
            Object.defineProperty(environment, 'document', {
                value: document,
                enumerable: true
            });

            runNits(environment, nitDir, files,
                    function() { writeOutput(document, outputFile) });
        }
    });
};

var cmdlineInvoke = function() {
    process.stderr.write('IETF RFC Lint for HTML\n');

    var nitDir;
    var showUsage = false;
    var inputIndex;
    if (process.argv.length >= 4) {
        if (process.argv[2] == '--nitdir') {
            if (process.argv.length != 6) {
                showUsage = true;
            } else {
                nitDir = process.argv[3];
                inputIndex = 4;
            }
        } else {
            var basedir = process.mainModule.filename.replace(
                /(^.*[\/\\])[^\/\\]*/, '$1');
            nitDir = basedir + 'nits';
            inputIndex = 2;
        }
    } else {
        showUsage = true;
    }

    if (inputIndex && process.argv.length != inputIndex + 2)
        showUsage = true;

    if (showUsage) {
        process.stderr.write('Usage: ' + process.argv[0] + ' ' + process.argv[1]
                             + ' [--nitdir dir] <input> <output>\n');
        process.exit(-1);
    } else {
        var input = process.argv[inputIndex];
        var output = process.argv[inputIndex+1];
        lint(nitDir, input, output);
    }
};

cmdlineInvoke();