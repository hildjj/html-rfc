exports.nit = function(env) {
    var $ = env.$;
    var i = 0;
    $("p").each(function() {
        var t = $(this);
        var id = t.attr("id");
        if (!id || id.match(/-p-\d+$/)) {
            var divid = t.closest("div").attr("id");
            t.attr("id", divid + "-p-" + t.index());
            i++;
        }
    });
}
exports.requires = "div-number.js";
