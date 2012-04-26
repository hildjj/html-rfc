var fs = require('fs');
var path = require('path');

exports.nit = function(env) {
    var $ = env.$;
    var def = $.Deferred();

    var style = $("style");
    if (style.length < 1) {
        var head = $("head");
        if (head.length < 1) {
            return def.reject("No head to put style in")
        }
        style = $("<style>").attr("type","text/css")
        head.append(style);
    }

    var css_path = path.resolve(path.dirname(module.filename),
                               "../data/rfc.css");

    fs.readFile(css_path, function(err, data) {
        if (err) {
            def.reject(err);
        } else {
            style.empty();
            style.comment("\n" + data + "\n");
            def.resolve();
        }
    })
    return def.promise();
}
