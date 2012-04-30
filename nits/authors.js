exports.nit = function(env) {
    var $ = env.$;
    // at least one author
    var authors = $(".section#authors address");
    if (authors.length < 1) {
        return env.error("No authors");
    }

    var hauth = $(".ietf .authors");
    hauth.empty();
    hauth.comment("Automatically generated from $('.section#authors address')");
    authors.each(function() {
        var author = $("<div>").addClass("author");
        $("<span>").addClass("initial").text($(".initial", this).text()).appendTo(author);
        $("<span>").addClass("surname").text($(".family-name", this).text()).appendTo(author);
        $("<span>").addClass("company").text($(".org", this).text()).appendTo(author);
        author.appendTo(hauth);
    });
};
