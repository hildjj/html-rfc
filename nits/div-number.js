exports.nit = function(env) {
    var $ = env.$;
    var i = 0;

    function sluggify(t, prefix) {
        var id = t.attr("id");
        if (!id || id.match(new RegExp("^" + prefix + "\d+$"))) {
            var slug = $("h1, h2, h3, h4, h5", t).first().text();
            if (slug) {
                slug = slug.replace(/\W+/g, "-");
                t.attr("id", slug.toLowerCase());
            } else {
                t.attr("id", prefix + i);
                i++;
            }
        }
    }

    $("div.section").each(function() {
        sluggify($(this), "section-");
    });

    i = 0;
    $("div.appendix").each(function() {
        sluggify($(this), "appendix-");
    });
};
exports.requires = "2119.js";
