function numToAppendix(n) {
    var az = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var i = n;
    var ret = "";
    while (i > 0) {
        ret = az.charAt((i-1)  % 26) + ret;
        i = Math.floor((i-1) / 26);
    }
    return ret;
}

function f($, ul, divs, depth, parnum) {
    if (!divs.length) {
        return null;
    }

    divs.each(function(i) {
        var div = $(this);
        var li = $("<li>");
        var h = $("h" + depth, div);
        if (!h.length) {
            h = $("<h" + depth + ">");
            h.text(div.attr('id'));
            div.prepend(h);
        }
        var num;
        if (parnum === "Appendix ") {
            num = parnum + numToAppendix(i+1) + ".";
        } else {
            num = parnum + (i+1) + ".";
        }
        var htxt = h.text().replace(/^(Appendix [A-Z]+\.)?([\d\.]+)?\s+/, "");
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

        var subs = $("> div.section", div);
        if (subs.length > 0) {
            li.append(f($, $("<ul>"), $("> div.section", div), depth+1, num));
        }
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
    var ul = $("<ul>").addClass("toc");
    toc.append(f($, ul, $("body > div.section"), 2, ""));
    toc.append(f($, ul, $("body > div.appendix"), 2, "Appendix "));
    toc.append(ul);
}

exports.requires = ["div-number.js", "depth.js"];
