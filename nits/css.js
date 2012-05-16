var fs = require('fs');
var path = require('path');

exports.nit = function(env) {
    var $ = env.$;
    var def = $.Deferred();

    var css_path = path.resolve(path.dirname(module.filename),
                               "../data/rfc.css");

    // blow away all styles, and re-add the right ones
    $("style").detach();
    $("link[rel='stylesheet']").detach();
    if (env.argv['final']) {
        fs.readFile(css_path, function(err, data) {
            if (err) {
                def.reject(err);
            } else {
                var style = $("<style type='text/css' />");
                style.comment("\n" + data + "\n");
                $("head").append(style);
                def.resolve();
            }
        });
        return def.promise();
    } else {
        $("<link rel='stylesheet' type='text/css' href='" + path.relative(env.argv.outdir, css_path) + "'>").appendTo($("head"));
    }
}

exports.requires = "header.js";
