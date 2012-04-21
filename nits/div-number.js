exports.nit = function(env) {
    var $ = env.$;
    var i = 0;

    $("div.section").each(function() {
        var t = $(this);
        var id = t.attr("id");
        if (!id || id.match(/^section-\d+$/)) {
            var slug = $("h1, h2, h3, h4, h5", t).first().text();
            if (slug) {
                slug = slug.replace(/\W+/g, "-");
                t.attr("id", slug.toLowerCase());
            } else {
                t.attr("id", "section-" + i);
                i++;
            }

        }
    });
};
