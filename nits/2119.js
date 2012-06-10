exports.nit = function(env) {
    var $ = env.$;

    var m = $("div#mustard");
    if (m.text().trim().length === 0) {
        $("<h3>Terminology</h3>").appendTo(m);
        $("<p>The key words \"MUST\", \"MUST NOT\", \"REQUIRED\", \"SHALL\", \"SHALL NOT\", \"SHOULD\", \"SHOULD NOT\", \"RECOMMENDED\", \"NOT RECOMMENDED\", \"MAY\", and \"OPTIONAL\" in this document are to be interpreted as described in <a class='ref' href='#rfc:2119'>RFC 2119</a>.</p>").appendTo(m);
    }

    var mustard = /((MUST|SHOULD|MAY|SHALL|OPTIONAL|REQUIRED|(NOT\s+)?RECOMMENDED)(\s+NOT)?)/g;
    $('body').find('*').textNodes().each(function(i){
        var p = this.parentNode;
        var pname = p.nodeName.toLowerCase();
        if ((p.className === 'rfc2119') || (pname === 'pre') || (pname === 'code')) {
            return;
        }
        var found = false;
        var val = this.nodeValue.replace(mustard, function(s) {
            found = true;
            return "<span class='rfc2119'>" + s + "</span>";
        });
        if (found) {
            $(this).replaceWith(val);
        }
    });
};
