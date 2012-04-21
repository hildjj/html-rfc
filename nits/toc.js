function f($, divs, depth, parnum) {
    if (!divs.length) {
        return null;
    }
    var ul = $("<ul>").addClass("toc");
    divs.each(function(i) {
        var div = $(this);
        var li = $("<li>").addClass("toc");
        var h = $("h" + depth, div);
        if (!h.length) {
            h = $("<h" + depth + ">");
            h.text(div.attr('id'));
            div.prepend(h);
        }
        var num = parnum + (i+1) + ".";
        var htxt = h.text().replace(/^[\d\.]+\s+/, "");
        h.text(num + " " + htxt);

        var ldiv = $("<div>")
        ldiv.text(num + " ");
        ldiv.append($("<a>").text(htxt).
            attr("href", "#" + $(div).attr('id')));
        li.append(ldiv);
        li.append(f($, $("> div.section", div), depth+1, num));
        ul.append(li);
    });
    return ul;
}

function toc_nit(env) {
    var $ = env.$
    var toc = $("div#toc");
    if (!toc.length) {
        onCompletion("No #toc div");
    }

    toc.empty();
    toc.append($("<h2>").text("Table of Contents"));
    toc.append(f($, $("body > div.section"), 2, ""));
}

toc_nit.requires = ["div-number.js"];
exports.nit = toc_nit;
