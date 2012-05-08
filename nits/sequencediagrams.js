var url = require('url');
var http = require('http');
var wsd = require('websequencediagrams');

exports.nit = function(env) {
    var $ = env.$;
    var prom = [];

    $("img.sequence[alt]").each(function() {
        var that = $(this);
        var def = $.Deferred();
        prom.push(def);
        var alt = that.attr('alt');
        env.log.trace("Sequence diagram: '%s'", alt.trim().split("\n")[0]);
        wsd.diagram(alt, "modern-blue", "png", function(er, buf, typ){
            if (er) {
                def.reject(er);
                return;
            }
            that.attr('src', 'data:' + typ + ';base64,' + buf.toString('base64'));
            def.resolve();
        });
    });
    return $.when.apply($, prom);
}
