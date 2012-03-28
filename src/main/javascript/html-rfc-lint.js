var functions = require('./functions');

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
        functions.lint(nitDir, input, output, 
             function(err) {
                 if (err) {
                     process.stderr.write('Argh! Processing error!\n' 
                         + Array.prototype.slice.call(arguments, 0) + '\n');
                     process.exit(-2);
                 }
             });
    }
};

cmdlineInvoke();