var fs = require('fs');
var jsdom = require('jsdom');

var runNits = function(environment, nitDir, files) {
    // TODO Windows support
    var pathsep = '/';

    files.forEach(function(nitFile) { 
        // only run js files -- allows README.md etc.
        if (!nitFile.match(/.*\.js$/))
            return;

        nitFile = fs.realpathSync(nitDir + pathsep + nitFile);
        var nit = require(nitFile);
        var result = nit.nit(environment);
        var result = null;
        if (result) {
            console.log('Error while running through ' + nitFile + '!');
            console.log(result);
            process.exit(-3);
        }
    });
};

var writeOutput = function(document, outputFile) {
    
};

var lint = function(nitDir, inputFile, outputFile) {

    fs.readdir(nitDir, function(err, files) {
        if (err) {
            console.log('Argh! Errors!');
            console.log(err);
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

            runNits(environment, nitDir, files);
            writeOutput(document, outputFile);
        }
    });
};

var cmdlineInvoke = function() {
    console.log('IETF RFC Lint for HTML');

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
        console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [--nitdir dir] <input> <output>');
        process.exit(-1);
    } else {
        var input = process.argv[inputIndex];
        var output = process.argv[inputIndex+1];
        lint(nitDir, input, output);
    }
};

cmdlineInvoke();