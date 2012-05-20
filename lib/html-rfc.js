var fs      = require('fs');
var stream  = require('stream');
var jsdom   = require('jsdom');
var xhr     = require('xmlhttprequest');
var log4js  = require('log4js');
var pty     = require('./html-pretty').pretty;
var bstream = require('./bstream');
var nit     = require('./nit');
var jQuery  = require('jQuery');

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

RFC.prototype.loadNits = function(nitDir) {
    var that = this;
    var def = jQuery.Deferred();
    fs.readdir(nitDir, function(er, files) {
        if (er) {
            def.reject(er);
            return;
        }
        that.$.when.apply(that.$, files.map(function(fname) {
            if (!fname.match(/\.js$/)) {
                return null; // when treats this as a resolved promise
            }
            return nit.get(nitDir, fname).done(function(n) {
                that.nits.push(n);
            });
        })).done(function() {
            that.sortNits();
            def.resolve();
        }).fail(function(er) {
            def.reject(er);
        });
    });
    return def.promise();
};

RFC.prototype.sortNits = function() {
    var that = this;
    // Array.sort() won't work since we only have partial ordering.
    // O(n^2) selection sort as a fallback.
    function smallest(start) {
        var s = that.nits[start];
        var idx = start;
        for (var i=start+1; i<that.nits.length; i++) {
            var other = that.nits[i];
            if (s.dependsOn(other)) {
                s = other;
                idx = i;
            }
        }
        return idx;
    }
    for (var j=0; j<that.nits.length; j++) {
        var o = smallest(j);
        if (o !== j) {
            var tmp = that.nits[o];
            that.nits[o] = that.nits[j];
            that.nits[j] = tmp;
        }
    }
};

RFC.prototype.state = function() {
    var that = this;
    var all = {};
    that.nits.forEach(function(n){
        all[n.name] = !!n.promise;
    });
    that.log.trace(all);
};

RFC.prototype.lint = function() {
    var that = this;
    var execd = [];
    that.nits.forEach(function(n){
        n.reset();
    });
    that.current_nit = null;
    that.nits.forEach(function(n){
        execd.push(n.exec(that));
    });
    return that.$.when.apply(that.$, execd);
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
