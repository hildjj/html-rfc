var fs      = require('fs');
var path    = require('path');
var stream  = require('stream');
var jsdom   = require('jsdom');
var xhr     = require("xmlhttprequest");
var log4js  = require('log4js');
var pty     = require('./html-pretty').pretty;
var bstream = require('./bstream');

// TODO: replace with https://github.com/linuxwolf/node-jquery
var jquery_path = path.resolve(path.dirname(module.filename),
                               "../data/jquery-1.7.2.min.js");

var jquery = fs.readFileSync(jquery_path).toString();

function noop() {
}

var RFC = function(input, log, argv, cb) {
    this.input = input;
    if (!log) {
        log4js.appenderMakers['console']({"writer": function(evt) { process.stderr.write(evt + "\n"); }});
        this.log = log4js.getLogger();
    } else {
        this.log = log;
    }
    this.argv = argv || {};
    if (!cb) {
        cb = noop;
    }
    this.allNits = {};

    var that = this;
    if (this.input instanceof stream.Stream) {
        this.path = this.input.path;
        // read from stream into string, parse, then call cb
        that.readStream(this.input, function(err, html) {
            if (err) {
                cb(err, that);
            } else {
                that.parseHTML(html, function(err, win) {
                    cb(err, that);
                });
            }
        });
    } else if (typeof(input) === "string") {
        this.path = this.input;
        // jsdom can deal with an HTML string, URL, or a filename
        that.parseHTML(input, function(err, win) {
            cb(err, that);
        });
    } else {
        throw "Bad RFC input type";
    }
};

RFC.prototype.parseHTML = function(html, cb) {
    var that = this;
    jsdom.env({
        html: html,
        src: [ jquery ],
        done: function(err, window) {
            if (err) {
                that.log.error(err);
            } else {
                window.$.ajaxSettings.xhr = function() {
                    return new xhr.XMLHttpRequest();
                };
                window.$.ajaxSettings.converters['text xml'] = function(data) {
                    return window.$(jsdom.jsdom(data));
                };
                window.$.support.cors = true;
                window.$.fn.extend({
                    pretty: function() {
                        var stream = new bstream();
                        window.$.each(this, function() {
                            pty(this, stream);
                        });
                        return stream.toString().trimRight();
                    },
                    comment: function(txt) {
                        return window.$(window.$.map(this, function(n) {
                            var c = n.ownerDocument.createComment(txt);
                            n.appendChild(c);
                            return c;
                        }));
                    }
                });
                that.window = window;
                that.$ = window.$;
                that.document = window.document;
                that.timestamp = new Date();
            }
            cb(err, window);
        }
    });
};

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
            cb(error);
            return;
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
    var req = require(this.path);
    this.nit = req.nit;
    if (!this.nit) {
        throw "No exports.nit in: " + this.path;
    }
    this.requires = [];

    if (typeof(req.requires) === "string") {
        this.requires.push(this.rfc.getNit(dir, req.requires));
    } else if (Array.isArray(req.requires)) {
        for (var i=0; i<req.requires.length; i++) {
            this.requires.push(this.rfc.getNit(dir, req.requires[i]));
        }
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
        var def = $.Deferred();
        that.promise = def.promise();
        $.when.apply($, all).done(function(){
            that.rfc.current_nit = that;
            $.when(that.nit(that.rfc)).done(function(){
                def.resolve();
            }).fail(function(){
                def.reject.apply(def, arguments);
            });
        }).fail(function(){
            def.reject.apply(def, arguments);
        });
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

RFC.prototype.error = function(def, msg) {
    var args = Array.prototype.slice.call(arguments);
    if (def && this.$.isFunction(def.isRejected)) {
        args.shift();
    } else {
        def = this.$.Deferred();
    }
    var stack = new Error().stack;
    this.log.trace("Error in: '%s'", stack);
    this.log.error.apply(this.log, args);
    if (this.$.isFunction(def.reject)) {
        return def.reject.apply(def, args);
    }
};

RFC.prototype.lint = function(nitDir, cb) {
    var that = this;
    if (!cb) {
        cb = noop;
    }
    fs.readdir(nitDir, function(err, files) {
        if (err) {
            that.log.error("Bad nit dir", err);
            cb(err);
        } else {
            that.runNits(nitDir, files)
                .done(function() { cb(null, that.document); })
                .fail(function(err) {
                    that.log.error("FAIL");
                    cb.call(Array.prototype.slice.call(arguments));
                });
        }
    });
};

exports.RFC = RFC;
