exports.nit = function figcaption(env) {
    var $ = env.$;
    var num = 1;
    $('figcaption').each(function() {
        var cap = $(this);

        var id = this.id || this.parentNode.id;
        if (!id || /^fig-\d+$/.test(id)) {
            id = "fig-" + num;
            this.parentNode.id = id;
        }
        var f = cap.text();
        f = f.replace(/^Figure\s[0-9\.]+\s/, "");
        cap.empty();
        cap.text(" " + f);
        cap.prepend($("<a>")
            .addClass('self-ref')
            .text("Figure " + (num++) + ".").
            attr("href", "#" + id));
    });
}
