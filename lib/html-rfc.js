var fs     = require('fs');
var path   = require('path');
var stream = require('stream');
var jsdom  = require('jsdom');
var xhr    = require("xmlhttprequest");
var log4js = require('log4js');

// TODO: replace with https://github.com/linuxwolf/node-jquery
var jquery_path = path.resolve(path.dirname(module.filename),
                               "../data/jquery-1.7.2.min.js")

var jquery = fs.readFileSync(jquery_path).toString();

function noop() {
}

var RFC = function(input, log, cb) {
    this.allNits = {};

    if (log) {
        this.log = log;
    } else {
        log4js.appenderMakers['console']({"writer": function(evt) { process.stderr.write(evt + "\n")}});
        this.log = log4js.getLogger();
    }

    if (!cb) {
        cb = noop;
    }

    var that = this;
    if (input instanceof stream.Stream) {
        // read from stream into string, parse, then call cb
        that.readStream(input, function(err, html) {
            if (err) {
                cb(err, that);
            } else {
                that.parseHTML(html, function(err, win) {
                    cb(err, that);
                });
            }
        });
    } else if (typeof(input) === "string") {
        // jsdom can deal with an HTML string, URL, or a filename
        that.parseHTML(input, function(err, win) {
            cb(err, that);
        });
    }
};

RFC.prototype.parseHTML = function(html, cb) {
    var that = this;
    jsdom.env({
        html: html,
        src: [ jquery ],
        done: function(err, window) {
            if (err) {
                that.log.error(errors);
            } else {
                window.$.ajaxSettings.xhr = function() {
                    return new xhr.XMLHttpRequest();
                }
                window.$.ajaxSettings.converters['text xml'] = function(data) {
                    return window.$(jsdom.jsdom(data));
                }
                window.$.support.cors = true;
                that.window = window;
                that.$ = window.$;
                that.document = window.document;
                that.timestamp = new Date();
            }
            cb(err, window);
        }
    });
}

RFC.prototype.readStream = function(s, cb) {
    var buffers = [];
    var nread = 0;
    var error;
    var that = this;

    s.on('data', function(chunk) {
        buffers.push(chunk);
        nread += chunk.length;
    });

    s.on('error', function(er) {
        error = er;
        s.destroy();
    });

    s.on('close', function() {
        if (error) {
            that.log.error(error);
            return cb(error);
        }

        var buffer;
        switch (buffers.length) {
        case 0:
            buffer = new Buffer(0);
            break;
        case 1:
            buffer = buffers[0];
            break;
        default:
            buffer = new Buffer(nread);
            var n = 0;
            buffers.forEach(function(b) {
                var ln = b.length;
                b.copy(buffer, n, 0, ln);
                n += ln;
            });
            break;
        }
        buffer = buffer.toString('utf-8');
        cb(null, buffer);
    });
};

var Nit = function(dir, name, rfc) {
    this.name = name;
    this.rfc = rfc;
    this.path = fs.realpathSync(path.join(dir, name));
    this.promise = null;
    this.nit = require(this.path).nit;
    this.requires = []

    if (Array.isArray(this.nit.requires)) {
        for (var i=0; i<this.nit.requires.length; i++) {
            this.requires.push(this.rfc.getNit(dir, this.nit.requires[i]));
        }
    } else if (typeof(this.nit.requires) === "string") {
        this.requires.push(this.rfc.getNit(this.nit.requires));
    }
};

Nit.prototype.call = function() {
    if (!this.promise) {
        var $ = this.rfc.$;
        var all = [];
        var that = this;
        $.each(this.requires, function() {
            all.push(this.call(that.rfc));
        });
        all.push($.when(this.nit(that.rfc)));
        this.promise = $.when.apply($, all);
    }
    return this.promise;
};

RFC.prototype.getNit = function(dir, name) {
    this.log.debug("Getting:", name);
    if (this.allNits.hasOwnProperty(name)) {
        return this.allNits[name];
    }
    var n = new Nit(dir, name, this);
    this.allNits[name] = n;
    return n;
};

RFC.prototype.runNits = function(nitDir, files) {
    var all = [];
    for (var i=0; i<files.length; i++) {
        var fname = files[i];
        if (fname.match(/\.js$/)) {
            all.push(this.getNit(nitDir, fname).call());
        }
    }

    return this.$.when.apply(this.$, all);
};

RFC.prototype.lint = function(nitDir, cb) {
    var that = this;
    fs.readdir(nitDir, function(err, files) {
        if (err) {
            that.log.error("Bad nit dir", err);
            cb(err);
        } else {
            that.runNits(nitDir, files)
                .done(function() { cb(null, that.document); })
                .fail(function(err) {
                    that.log.error("runNit fail: ", err);
                    cb(err);
                });
        }
    });
};

exports.RFC = RFC;
