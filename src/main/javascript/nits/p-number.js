exports.nit = function(env, onCompletion) {
    var $ = env.$;
    var i = 0;
    $("p").each(function() {
        var t = $(this);
        var id = t.attr("id");
        if (!id || id.match(/^para-\d+$/)) {
            t.attr("id", "para-" + i);
            i++;
        }
    });
    onCompletion();
};
