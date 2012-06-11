var crypto = require('crypto');
var fs     = require('fs');
var http   = require('http');
var path   = require('path');
var url    = require('url');
var wsd    = require('websequencediagrams');

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
};

// Don't use the generic img processing in images.js, since the URL that
// is returned from websequencediagrams.com is short-lived.
function getDiagram(that, message, sum, file, env, def) {
    env.log.trace("Sequence diagram: '%s'", message.trim().split("\n")[0]);
    wsd.diagram(message, "modern-blue", "png", function(er, buf, typ) {
        if (er) {
            def.reject(er);
            return;
        }
        that.attr('id', sum);
        if (env.argv.final) {
            that.attr('src', 'data:' + typ + ';base64,' + buf.toString('base64'));
            def.resolve();
        } else {
            // save next to the output file
            that.attr('src', file);
            if (env.argv.outdir) {
                var fn = path.join(env.argv.outdir, file);
                fs.writeFile(fn, buf, function(er){
                    if (er) {
                        env.error(er);
                    } else {
                        def.resolve();
                    }
                });
            }
        }
    });
}

exports.nit = function sequencediagrams(env) {
    var $ = env.$;
    var prom = [];

    $("img.sequence[alt]").each(function() {
        var that = $(this);
        var alt = that.attr('alt');
        if (!alt) { // [attr] checks don't seem to work.
            return;
        }
        var shasum = crypto.createHash('sha1');
        shasum.update(alt);
        var altsum = shasum.digest('hex');
        var asrc  = 'wsd-' + altsum + '.png';

        var def = $.Deferred();
        prom.push(def.promise());

        var src = that.attr('src')
        if (((src === asrc) || (src.slice(0,5) === "data:")) &&
            (that.attr('id') === altsum)) {
            var src_file = path.join(env.argv.outdir, asrc);
            path.exists(src_file, function(exists) {
                // Only get the file if the source has changed, or the
                // file got deleted
                if (exists) {
                    def.resolve();
                } else {
                    getDiagram(that, alt, altsum, asrc, env, def);
                }
            });
        } else {
            getDiagram(that, alt, altsum, asrc, env, def);
        }
    });
    return $.when.apply($, prom);
}
