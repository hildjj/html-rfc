exports.nit = function(env) {
    var $ = env.$;
    $.fn.extend({
        textNodes: function() {
            return $($.map(this, function(n) {
                return $.grep(n.childNodes, function(n) {
                    return n.nodeType == 3;
                });
            }));
        }
    });

    // TODO: add BCP, and parse http://www.rfc-editor.org/bcp-index.html
    // as needed.
    var ref_re = /(RFC|XEP)\s*-?\s*(\d+)/g;
    $('body').find('*').textNodes().each(function(i){
        var p = this.parentNode;

        // if we're in the reference, don't do anything
        if ((p.nodeName.toLowerCase() === "span") &&
            ($(p).closest("div.ref").length > 0)) {
            return;
        }

        var only_check = ((p.nodeName.toLowerCase() === "a") && (p.className === "ref"));
        var found = false;

        var val = this.nodeValue.replace(ref_re, function(s, series, num) {
            series = series.toLowerCase();
            var ref_id = series + ":" + num;
            var ref_id_q = series + "\\:" + num;
            if ($("div.ref#"+ref_id_q).length === 0) {
                env.log.warn('Adding to references:', ref_id);
                // no ref in the references section yet.
                var top = $("div.section#references");
                if (top.length === 0) {
                    top = $("<div id='references' class='section'>");
                    $("body").append(top);
                }
                var norm = $("div.section#normative", top);
                if (norm.length === 0) {
                    norm = $("<div id='normative' class='section'>");
                    top.prepend(norm);
                }
                $("<div id='" + ref_id + "' class='ref'>").appendTo(norm);
            }
            if (only_check) {
                return s;
            } else {
                found = true;
                return "<a class='ref' href='#" + ref_id + "'>" + s + "</a>";
            }
        });
        if (found) {
            $(this).replaceWith(val);
        }
    });
}
