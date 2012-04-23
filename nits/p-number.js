function pnum_nit(env) {
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
pnum_nit.requires = "div-number.js";
exports.nit = pnum_nit;
