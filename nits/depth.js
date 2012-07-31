exports.nit = function(env) {
    var $ = env.$;
    $('.section h2,h3,h4,h5,h6').each(function() {
        var h = $(this);
        var depth = h.parentsUntil("body").length + 1;
        if (this.name.toUpperCase() !== "H"+depth) {
            env.log.warn("Bad depth: ", h.parent().attr("id"));
            h.after($("<h"+depth+">" + h.text() + "</h"+depth+">"));
            h.detach();
        }
    });
}
