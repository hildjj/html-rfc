var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mm = require('mime-magic');
var Canvas = require('canvas');

function bcat(bufs) {
    if (!Array.isArray(bufs)) {
        bufs = arguments;
    }
    switch (bufs.length) {
        case 0:
            return new Buffer(0);
        case 1:
            return bufs[0];
        default:
            break;
    }
    var len = bufs.reduce(function(prev,cur) {
        return prev + cur.length;
    }, 0);
    var buf = new Buffer(len);
    bufs.reduce(function(prev,cur) {
        cur.copy(buf, prev);
        return prev + cur.length;
    }, 0);
    return buf;
}

function parse_buffer(buf, typ, that) {
    var img = new Canvas.Image();
    img.onerror = function(er) {
        // this shouldn't happen, so don't bother to pass env in.
        console.error(er);
    };
    img.src = buf;
    that.attr('width', img.width);
    that.attr('height', img.height);
    that.attr('src', 'data:' + typ + ';base64,' + buf.toString('base64'));
}

var iter = 0;
function read_stream(s, typ, def, that, env) {
    var bufs = [];
    var i = iter++;

    s.on('data', function(chunk) {
        bufs.push(chunk);
    });
    s.on('error', function(er) {
        env.error(def, er);
    });
    s.on('end', function() {
        parse_buffer(bcat(bufs), typ, that);
        def.resolve();
    });
}

// Replace images with their data: equivalents.
exports.nit = function(env) {
    var $ = env.$;
    var prom = [];

    // img's which have a src, where the src is not yet a data: URI,
    // or don't have a height + width.
    $("img[src]").each(function(){
        var that = $(this);
        var src = that.attr('src');
        if (!src) {
            return;
        }
        var isrc = src;
        if (src.length > 35) {
            isrc = src.slice(0,32) + "...";
        }
        if (!that.attr('alt')) {
            env.log.warn("No alt text on image: '%s'", isrc);
        }
        if ((src.indexOf("data:") === 0) &&
            that.attr('height') &&
            that.attr('width')) {
            return; // continue
        }

        var u = url.parse(src);
        var def = $.Deferred();
        prom.push(def);

        env.log.trace("Image: '%s'", isrc);
        switch (u.protocol) {
            case 'http:':
                http.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], def, that, env);
                }).on('error', function(er) {
                    env.error(def, er);
                });
                break;
            case 'https:':
                https.get(u, function(res) {
                    read_stream(res, res.headers['content-type'], def, that, env);
                }).on('error', function(er) {
                    env.error(def, er);
                });
                break;
            case "file:":
                src = url.pathname;
                // fall through
            case undefined:
                src = path.resolve(path.dirname(env.path), src);
                mm.fileWrapper(src, function(er, typ) {
                    if (er) {
                        env.error(def, er);
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
                    env.error(def, "Invalid data URI: '%s'", isrc);
                    return; // continue
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
                        env.error(def, "Invalid data: URI encoding: ", m[2]);
                        return; // continue
                }
                parse_buffer(buf, m[1], that);
                def.resolve();
                break;
            default:
                env.error(er, "Unknown image source URI scheme: ", u.protocol);
                break;
        }
    });

    return $.when.apply($, prom);
}

exports.requires = 'sequencediagrams.js';
