var fs      = require('fs');
var stream  = require('stream');

var jsdom   = require('jsdom');
var jQuery  = require('jQuery');
var log4js  = require('log4js');
var xhr     = require('xmlhttprequest');

var pty     = require('./html-pretty').pretty;
var bstream = require('./bstream');
var nit     = require('./nit');

var whenEver = require('./misc').whenEver;

var RFC = function(input, log, argv) {
    this.input = input;
    if (!log) {
        log4js.appenderMakers['console']({"writer": function(evt) { process.stderr.write(evt + "\n"); }});
        this.log = log4js.getLogger();
    } else {
        this.log = log;
    }
    this.argv = argv || {};
    this.nits = [];

    var def = jQuery.Deferred();
    var that = this;
    if (that.input instanceof stream.Stream) {
        that.path = that.input.path;
        // read from stream into string, parse, then call cb
        that.readStream(that.input).done(function(html){
            that.parseHTML(html).done(function(){
                def.resolve(that);
            }).fail(def.reject);
        }).fail(def.reject);
    } else if (typeof(input) === "string") {
        that.path = that.input;
        // jsdom can deal with an HTML string, URL, or a filename
        that.parseHTML(input).done(function(){
                def.resolve(that);
            }).fail(def.reject);
    } else {
        throw "Bad RFC input type";
    }
    return def.promise();
};

RFC.prototype.parseHTML = function(html) {
    var that = this;
    var def = jQuery.Deferred();
    jsdom.env({
        html: html,
        done: function(er, window) {
            if (er) {
                def.reject(er);
                return;
            }
            window.$ = jQuery.create(window);
            window.$.ajaxSettings.converters['text xml'] = function(data) {
                return window.$(jsdom.jsdom(data));
            };

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
            def.resolve(window);
        }
    });
    return def.promise();
};

RFC.prototype.readStream = function(s) {
    var buffers = [];
    var nread = 0;
    var that = this;
    var def = jQuery.Deferred();

    s.on('data', function(chunk) {
        buffers.push(chunk);
        nread += chunk.length;
    });

    s.on('error', function(er) {
        s.destroy();
        def.reject(er);
    });

    s.on('close', function() {
        if (def.state() === 'rejected') {
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
        def.resolve(buffer);
    });
    return def.promise();
};

RFC.prototype.loadDir = function(dir) {
    var that = this;
    return nit.loadDir(dir).done(function(ns) {
        that.nits = that.nits.concat(ns);
    });
};

RFC.prototype.lint = function() {
    var that = this;
    that.nits.forEach(function(n){
        n.reset();
    });
    that.current_nit = null;
    return whenEver(that.nits, function(n) {
        return n.exec(that);
    });
};

RFC.prototype.error = function(def, msg) {
    var args = Array.prototype.slice.call(arguments);
    // TODO: what happens if we fail loading jquery?
    if (def && this.$.isFunction(def.isRejected)) {
        args.shift();
    } else {
        def = jQuery.Deferred();
    }
    var stack = new Error().stack;
    this.log.trace("Error in: '%s'", stack);
    this.log.error.apply(this.log, args);
    if (this.$.isFunction(def.reject)) {
        return def.reject.apply(def, args);
    }
};

exports.RFC = RFC;
