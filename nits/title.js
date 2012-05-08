exports.nit = function(env) {
    var $ = env.$;
    // Title is required
    var h1 = $("div#title h1");
    if (h1.length != 1) {
        return env.error("Wrong number of title divs: %d", h1.length);
    }
    var txt = h1.text();
    $("html > head > title").text(txt);
    $("html > head > name[description]").attr('content', txt);
}

exports.requires = "header.js";
