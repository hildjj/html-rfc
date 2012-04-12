Contains node.js module files to be evaluated against a document by
the IETF RFC Lint tool. The modules should export a function at
exports.nit; that function will be invoked with an execution
environment and the document to process. Return a non-null value to
communicate an error.

Example: 

exports.nit = function(env, onCompletion) { 
    console.log('Hello, IETF!'); 
    onCompletion();
};