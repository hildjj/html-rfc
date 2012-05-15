var path = require('path');

exports.nit = function(env) {
    var $ = env.$;
    // Title is required
    var h1 = $("div#title h1");
    if (h1.length === 0) {
        env.log.warn("No Title.  Adding one that needs to be edited.");
        $("div.ietf").after($("<div id='title'><h1>Template</h1></div>"));
        h1 = $("div#title h1");
    }
    var txt = h1.text();
    $("html > head > title").text(txt);
    $("html > head > name[description]").attr('content', txt);

    if (env.argv.outfile) {
        var fn = $("div#title > div#filename")
        if (fn.length === 0) {
            fn = $("<div id='filename' />");
            h1.after(fn);
        }
        fn.text(path.basename(env.argv.outfile));
    }
}

exports.requires = ["header.js", "authors.js"];
