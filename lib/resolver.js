var fs = require('fs');
var path = require('path');
var url = require('url');

var bstream = require('./bstream')

var hg = require('http-get');
var mime = require('mime');

// cb(er, results)
// results has buffer, protocol, contentType
exports.get = function get(src, pth, cb) {
    var u = url.parse(src);
    var ret = {
        protocol: u.protocol,
        remote: false
    };

    switch (u.protocol) {
        case 'http:':
        case 'https:':
            ret.remote = true;
            hg.get({
                url: src,
                bufferType: "buffer"
            }, function(er, res) {
                if (!er) {
                    ret.buffer = res.buffer;
                    ret.contentType = res.headers['content-type'];
                }
                cb(er, ret);
            });
            break;
        case "file:":
            src = url.pathname;
            // fall through
        case undefined:
            ret.protocol = 'file:';
            src = path.resolve(pth, src);
            fs.exists(src, function(exists) {
                if (!exists) {
                    cb("File not found: " + src, ret);
                } else {
                    var str = fs.createReadStream(src);
                    new bstream().readStream(str, function(er, buf) {
                        if (!er) {
                            ret.buffer = buf;
                            ret.contentType = mime.lookup(src);
                        }
                        cb(er, ret);
                    });
                }
            });
            break;
        case "data:":
            var m = src.match(/^data:([^;,]+)(;base64)?,(.*)/);
            if (!m) {
                cb("Invalid data URI: " + src.slice(0,32) + "...", ret);
                return; // continue
            }
            switch (m[2]) {
                case ';base64':
                    ret.buffer = new Buffer(m[3], 'base64');
                    ret.contentType = m[1];
                    cb(null, ret);
                    break;
                case undefined:
                    ret.buffer = new Buffer(decodeURI(m[3]));
                    ret.contentType = m[1];
                    cb(null, ret);
                    break;
                default:
                    cb("Invalid data: URI encoding: " + m[2], ret);
                    break;
            }
            break;
        default:
            cb("Unknown image source URI scheme: " + u.protocol, ret);
            break;
    }
}
