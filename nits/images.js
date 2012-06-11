var crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');

var mime = require('mime');
var Canvas = require('canvas');
var bstream = require('../lib/bstream.js')

var PREFIX = "imgsrc-";
var PREFIX_RE = new RegExp("^" + PREFIX + "(.*)$");

function parse_buffer(def, buf, typ, that, env, remote) {
    var img = new Canvas.Image();
    img.onerror = function(er) {
        // this shouldn't happen, so don't bother to pass env in.
        console.error(er);
    };
    img.src = buf;
    that.attr('width', img.width);
    that.attr('height', img.height);
    if (env.argv['final']) {
        that.attr('src', 'data:' + typ + ';base64,' + buf.toString('base64'));
        def.resolve();
    } else if (remote) {
        // img[id] becomes the encoded URL
        // img[src] becomes imgsrc-sha1(url).png (e.g.)
        var id = that.attr('src');

        var shasum = crypto.createHash('sha1');
        shasum.update(id);
        var hash = shasum.digest('hex');
        var src = PREFIX + hash + "." + mime.extension(typ);
        var pth = path.resolve(path.dirname(env.path), src);
        var f = fs.createWriteStream(pth).on('error', function(er) {
            // perhaps the file exists but isn't readable or writable
            def.reject(er);
        }).on('open', function() {
            f.end(buf);
            that.attr('id', id);
            that.attr('src', src);
            def.resolve();
        });
    } else {
        def.resolve();
    }
}

function check_src_for_url(that, env, def) {
    var src = that.attr('src');
    var m = src.match(PREFIX_RE);
    if (!m) {
        return false;
    }
    that.attr('src', that.attr('id'));
    get_img(that, env, def);
    return true;
}

function get_img(that, env, def) {
    var src = that.attr('src');
    if (!src) {
        return undefined;
    }
    var isrc = src;
    if (src.length > 35) {
        isrc = src.slice(0,32) + "...";
    }
    if (!that.attr('alt')) {
        env.log.warn("No alt text on image: '%s'", isrc);
    }

    if (!def) {
        def = $.Deferred();
    }
    var u = url.parse(src);

    switch (u.protocol) {
        case 'http:':
            env.log.trace("Getting image: '%s'", isrc);
            http.get(u, function(res) {
                new bstream().readStream(res, function(er, buf) {
                    if (er) {
                        env.error(def, er);
                    } else {
                        parse_buffer(def, buf, res.headers['content-type'], that, env, true);
                    }
                });
            }).on('error', function(er) {
                env.error(def, er);
            });
            break;
        case 'https:':
            env.log.trace("Getting image: '%s'", isrc);
            https.get(u, function(res) {
                new bstream().readStream(res, function(er, buf) {
                    if (er) {
                        env.error(def, er);
                    } else {
                        parse_buffer(def, buf, res.headers['content-type'], that, env, true);
                    }
                });
            }).on('error', function(er) {
                env.error(def, er);
            });
            break;
        case "file:":
            src = url.pathname;
            // fall through
        case undefined:
            src = path.resolve(path.dirname(env.path), src);
            path.exists(src, function(exists) {
                if (exists && that.attr('width') && that.attr('height')) {
                    def.resolve();
                    return;
                }
                var str = fs.createReadStream(src);
                new bstream().readStream(str, function(er, buf) {
                    if (er) {
                        // re-download the file if possible
                        if (!check_src_for_url(that, env, def)) {
                            env.error(def, er);
                        }
                    } else {
                        parse_buffer(def, buf, mime.lookup(src), that, env, false);
                    }
                });
            });
            break;
        case "data:":
            if (that.attr('width') && that.attr('height')) {
                def.resolve();
                return;
            }
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
            parse_buffer(def, buf, m[1], that, env, false);
            break;
        default:
            env.error(er, "Unknown image source URI scheme: ", u.protocol);
            break;
    }

    return def.promise();
}

// download remote images,
//   store locally if not in final mode
//   replace images with their data: equivalents when in final mode,
// fix height/width
exports.nit = function(env) {
    var $ = env.$;
    var prom = [];

    // img's which have a src, where the src is not yet a data: URI,
    // or don't have a height + width.
    $("img[src]").each(function() {
        prom.push(get_img($(this), env));
    });

    return $.when.apply($, prom);
}

exports.requires = ['sequencediagrams.js', 'formula.js'];
