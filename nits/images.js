var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mm = require('mime-magic');

function read_stream(s, typ, cb) {
    var data = "data:" + typ + ",";
    s.on('data', function(chunk) {
        // encodeURI doesn't seem to work.  This is slow, and should be replaced.
        for (var i=0; i<chunk.length; i++) {
            var j = chunk[i];
            if (j<=0x30 || (j>0x39 && j<0x41) || (j>0x5a && j<0x61) || j>0x7a) {
                data += '%' + ("0" + j.toString(16)).slice(-2);
            } else {
                data += String.fromCharCode(j);
            }
        }
    });
    s.on('error', function(er) {
        cb(er);
    });
    s.on('end', function() {
        cb(null, data);
    });
}

// Replace images with their data: equivalents.
exports.nit = function(env) {
    var $ = env.$;
    var prom = [];
    var def;
    // img's which have a src, where the src is not yet a data: URI.
    $("img[src]:not([src^='data:'])").each(function(){
        that = $(this);
        var src = that.attr('src');
        var u = url.parse(src);
        switch (u.protocol) {
            case 'http:':
                def = $.Deferred();
                prom.push(def);
                http.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], function(er, data) {
                        if (er) {
                            def.reject(er);
                        } else {
                            that.attr('src', data);
                            def.resolve();
                        }
                    });
                }).on('error', function(er) {
                    env.log.error(er);
                    def.reject(er);
                });
                break;
            case 'https:':
                def = $.Deferred();
                prom.push(def);
                https.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], function(er, data) {
                        if (er) {
                            def.reject(er);
                        } else {
                            that.attr('src', data);
                            def.resolve();
                        }
                    });
                }).on('error', function(er) {
                    env.log.error(er);
                    def.reject(er);
                });
                break;
            case "file:":
                src = url.pathname;
                // fall through
            case undefined:
                def = $.Deferred();
                prom.push(def);
                src = path.resolve(path.dirname(env.path), src);
                mm.fileWrapper(src, function(er, typ){
                    if (er) {
                        def.reject(er);
                        return;
                    }
                    env.log.trace("Image source (%s): '%s'", typ, src);
                    var str = fs.createReadStream(src).on('error', function(er) {
                        env.log.error(er);
                        def.reject(er);
                    });
                    read_stream(str, typ, function(er, data) {
                            if (er) {
                                def.reject(er);
                            } else {
                                that.attr('src', data);
                                def.resolve();
                            }
                    });

                });

                break;
            default:
                prom.push(env.error("Unknown image source URI scheme: '%s'" + u.protocol));
                break;
        }
    });
    return $.when.apply($, prom);
};
