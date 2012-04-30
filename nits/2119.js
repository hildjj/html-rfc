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

    var mustard = /((MUST|SHOULD|MAY|SHALL|OPTIONAL|(NOT\s+)?RECOMMENDED)(\s+NOT)?)/g;
    $('body').find('*').textNodes().each(function(i){
        var p = this.parentNode;
        if (p.className === "rfc2119") {
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
