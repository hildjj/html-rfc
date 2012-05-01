var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mm = require('mime-magic');
var Canvas = require('canvas');
var bufferstream = require('bufferstream');

function parse_buffer(buf, typ, that) {
    var img = new Canvas.Image();
    img.onerror = function(er) {
        console.log(er);
    }
    img.src = buf;
    that.attr('width', img.width);
    that.attr('height', img.height);
    that.attr('src', 'data:' + typ + ';base64,' + buf.toString('base64'));
}

function read_stream(s, typ, def, that, env) {
    var buf = new bufferstream({size:'flexible'})
    s.on('data', function(chunk) {
        buf.write(chunk);
    });
    s.on('error', function(er) {
        env.log.error(er);
        def.reject(er);
    });
    s.on('end', function() {
        parse_buffer(buf.buffer, typ, that);
        def.resolve();
    });
}

// Replace images with their data: equivalents.
exports.nit = function(env) {
    var $ = env.$;
    var prom = [];
    var def;

    // img's which have a src, where the src is not yet a data: URI,
    // or don't have a height + width.
    $("img[src]").each(function(){
        that = $(this);
        var src = that.attr('src');
        var isrc = src;
        if (src.length > 35) {
            isrc = src.slice(0,32) + "...";
        }
        if (!that.attr('alt')) {
            env.log.warn("No alt text on image: '%s'", isrc)
        }
        if ((src.indexOf("data:") === 0) &&
            that.attr('height') &&
            that.attr('width')) {
            return; // continue
        }

        var u = url.parse(src);
        def = $.Deferred();
        prom.push(def);
        env.log.trace("Image: '%s'", isrc);
        switch (u.protocol) {
            case 'http:':
                http.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], def, that, env);
                }).on('error', function(er) {
                    env.log.error(er);
                    def.reject(er);
                });
                break;
            case 'https:':
                https.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], def, that, env);
                }).on('error', function(er) {
                    env.log.error(er);
                    def.reject(er);
                });
                break;
            case "file:":
                src = url.pathname;
                // fall through
            case undefined:
                src = path.resolve(path.dirname(env.path), src);
                mm.fileWrapper(src, function(er, typ) {
                    if (er) {
                        env.log.error(er);
                        def.reject(er);
                        return;
                    }
                    var str = fs.createReadStream(src);
                    read_stream(str, typ, def, that, env);
                });

                break;
            case "data:":
                // data: that didn't have a height or width.  Re-parse the image.
                var m = src.match(/^data:([^;,]+)(;base64)?,(.*)/);
                if (!m) {
                    var er = "Invalid data URI";
                    env.log.error(er);
                    def.reject(er);
                    return;
                }
                var buf;
                switch (m[2]) {
                    case ';base64':
                        buf = new Buffer(m[3], 'base64');
                        break;
                    case undefined:
                        buf = new Buffer(decodeURI(m[3]));
                        break;
                    default:
                        var er = "Invalid data: URI encoding: " + m[2];
                        env.log.error(er);
                        def.reject(er);
                        return;
                }
                parse_buffer(buf, m[1], that);
                def.resolve();
                break;
            default:
                var er = "Unknown image source URI scheme: " + u.protocol;
                env.log.error(er)
                def.reject(er);
                break;
        }
    });
    return $.when.apply($, prom);
};
