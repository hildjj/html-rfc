// find all FIG:foo in plain text, replace with a ref to the given figure.
// next: update all figrefs to have the new figure numbers
exports.nit = function figref(env) {
    var $ = env.$;
    var ref_re = /FIG:([\w-]+)/g;
    $('body').find('*').textNodes().each(function() {
        var found = false;
        var val = this.nodeValue.replace(ref_re, function(s, id) {
            found = true;
            return "<a href='#" + id +"' class='figref'>Figure " + id + "</a>";
        });
        if (found) {
            $(this).replaceWith(val);
        }
    });
    // now fixup the fignums
    $("a.figref").each(function() {
        var that = $(this);
        var id = that.attr('href');
        if (id.charAt(0) !== '#') {
            env.log.warn("Invalid figure reference, requires #: '%s'", id);
            return; // continue
        }
        var txt = $(id + " a.self-ref").text();
        txt = txt.replace(/\.$/, ""); // trim trailing dot
        that.text(txt);
    });
};

exports.requires = "figcaption.js";
