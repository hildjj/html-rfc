var jQuery = require('jQuery');

// If fn != null, apply fn to every item of ary, calling $.wait() on
// the non-null responses.  Otherwise, just wait on the non-null items.
exports.whenEver = function(ary, fn) {
    var defs = [];
    // jQuery each works on arguments
    jQuery.each(ary, function(i, a) {
        var def = fn ? fn(a) : a;
        if (def) {
            defs.push(def);
        }
    });

    return jQuery.when.apply(jQuery, defs);
}

exports.deferize = function(fun) {
    var that = this;
    return function() {
        var def = jQuery.Deferred();
        var args = [].slice.call(arguments);
        args.push(function() {
            var args = [].slice.call(arguments);
            var er = args.shift();
            if (er) {
                def.reject(er);
            } else {
                def.resolve.apply(def, args);
            }
        });
        fun.apply(that, args);
        return def;
    }
}
