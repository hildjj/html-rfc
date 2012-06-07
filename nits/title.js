var path = require('path');

exports.nit = function(env) {
    var $ = env.$;
    // Title is required
    var h1 = $("#title");
    if (h1.length === 0) {
        env.log.warn("No Title.  Adding one that needs to be edited.");
        h1 = $("<h1 id='title'>Template</h1>");
        $("#document").after(h1);
    }
    var txt = h1.text();
    $("html > head > title").text(txt);
    $("html > head > name[description]").attr('content', txt);
}

exports.requires = ["header.js", "authors.js"];
