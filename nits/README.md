Contains node.js module files to be evaluated against a document by
the IETF RFC Lint tool. The modules should export a function at
exports.nit; that function will be invoked with an execution
environment. Return a jQuery Promise object if you need to 
execute something asynchronously.  When you're finished with your 
long-running execution, resolve the Promise.

The environment object includes these properties:
- $: a jQuery instance with the input document as context
- document: the input document as jsdom DOM
- timestamp: a JavaScript Date object with the date/time of execution

Simple Example: 

exports.nit = function(env) { 
    console.log(env.$("div#abstract p").text());
};

Deferred Example:

exports.nit = function(env) {
	var def = env.$.Deferred();
	something_async(function() {
		def.resolve();
	});
	return def.promise();
}