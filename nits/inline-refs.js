exports.nit = function(env) {
    var $ = env.$;

    // TODO: add BCP, and parse http://www.rfc-editor.org/bcp-index.html
    // as needed.
    var ref_re = /(RFC|XEP)\s*-?\s*(\d+)/g;
    $('body').find('*').textNodes().each(function(i){
        var p = this.parentNode;

        // if we're in the reference, don't do anything
        var pname = p.nodeName.toLowerCase();
        if (((pname === "span") && ($(p).closest("li.ref").length > 0)) ||
            (pname === 'pre') ||
            (pname === 'code')) {
            return;
        }

        var only_check = ((p.nodeName.toLowerCase() === "a") && (p.className === "ref"));
        var found = false;

        var val = this.nodeValue.replace(ref_re, function(s, series, num) {
            series = series.toLowerCase();
            var ref_id = series + ":" + num;
            var ref_id_q = series + "\\:" + num;
            if ($("li.ref#"+ref_id_q).length === 0) {
                env.log.warn('Adding to references:', ref_id);
                // no ref in the references section yet.
                var top = $("div.section#references");
                if (top.length === 0) {
                    top = $("<div id='references' class='section'>");
                    top.append($("<h2>References</h2>"))
                    $("body").append(top);
                }
                var norm = $("div.section#normative", top);
                if (norm.length === 0) {
                    norm = $("<div id='normative' class='section'>");
                    norm.append($("<h3>Normative References</h3>"))
                    top.prepend(norm);
                }
                var ul = $("ul", norm);
                if (ul.length === 0) {
                    ul = $("<ul>")
                    norm.append(ul);
                }
                $("<li id='" + ref_id + "' class='ref'>").appendTo(ul);
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
