exports.nit = function(env) {
    var $ = env.$;
    // at least one author
    var authors = $(".section#authors address");
    if (authors.length < 1) {
        return env.error("No authors");
    }

    var hauth = $("#document .authors");
    hauth.empty();
    hauth.comment("Automatically generated from $('.section#authors address')");
    authors.each(function() {
        var author = $("<div>").addClass("author");
        // Note: "initial" is not a valid RFC 6350 property name.
        var initial = $(".initial", this).text();
        if (initial.length === 0) {
            initial = $(".given-name", this).text().slice(0,1) + ".";
        }
        $("<span>").addClass("initial").text(initial).appendTo(author);
        $("<span>").addClass("surname").text($(".family-name", this).text()).appendTo(author);
        $("<span>").addClass("company").text($(".org", this).text()).appendTo(author);
        author.appendTo(hauth);
    });
};
