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
        h.empty();
        h.text(" " + htxt);
        var id = $(div).attr('id');
        h.prepend($("<a>").addClass('self-ref').text(num).
            attr("href", "#" + id));

        var ldiv = $("<div>");
        ldiv.text(num + " ");
        ldiv.append($("<a>").text(htxt).
            attr("href", "#" + id));
        li.append(ldiv);
        li.append(f($, $("> div.section", div), depth+1, num));
        ul.append(li);
    });
    return ul;
}

exports.nit = function(env) {
    var $ = env.$;
    var toc = $("div#toc");
    if (toc.length === 0) {
        toc = $("<div id='toc' />");
        $("div.section").first().before(toc);
    }

    toc.empty();
    toc.comment(" Please do not edit the table of contents.\n     It was automatically generated. ");
    toc.append($("<h2>").text("Table of Contents"));
    toc.append(f($, $("body > div.section"), 2, ""));
}

exports.requires = "div-number.js";
