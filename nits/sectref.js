// find all SECT:foo in plain text, replace with a ref to the given section.
// next: update all sectrefs to have the new figure numbers
exports.nit = function figref(env) {
    var $ = env.$;
    var ref_re = /SECT:([\w-]+)/g;
    $('body').find('*').textNodes().each(function() {
        var found = false;
        var val = this.nodeValue.replace(ref_re, function(s, id) {
            found = true;
            return "<a href='#" + id +"' class='sectref'>Section " + id + "</a>";
        });
        if (found) {
            $(this).replaceWith(val);
        }
    });
    // now fixup the fignums
    $("a.sectref").each(function() {
        var that = $(this);
        var id = that.attr('href');
        if (id.charAt(0) !== '#') {
            env.log.warn("Invalid section reference, requires #: '%s'", id);
            return; // continue
        }
        var txt = $(id + " a.self-ref").first().text();
        txt = "Section " + txt.replace(/\.$/, ""); // trim trailing dot
        that.text(txt);
    });
};

exports.requires = "toc.js";
