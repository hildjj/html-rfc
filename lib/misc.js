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
