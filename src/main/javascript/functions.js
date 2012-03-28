var fs = require('fs');
var jsdom = require('jsdom');

var runNits = function(environment, nitDir, files, onSuccess, onError) {
    // TODO Windows support
    var pathsep = '/';

    var nitHelper = function(environment, nitDir, files, index) {
        if (index >= files.length) {
            onSuccess();
            return;
        }

        var nitFile = files[index];

        var next = function(err) {
            if (err) {
                onError.apply(null, arguments);
            } else {
                nitHelper(environment, nitDir, files, index+1)
            }
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

exports.lint = function(nitDir, inputFile, outputFile, callback) {

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
                    function() { writeOutput(document, outputFile) },
                    callback);
        }
    });
};
