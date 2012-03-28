$ = require('jquery');
exports.nit = function(environment, onCompletion) { 
    process.stderr.write('w00t!\n');
    onCompletion();
};