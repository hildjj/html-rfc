var fs   = require('fs');
var path = require('path');

var $ = require('jQuery');
var whenEver = require('./misc').whenEver;

// singleton factory
var allNits = {}; // path -> promise
function getNit(dir, name) {
    var p = path.join(dir, name);
    var prom = allNits[p];
    if (!prom) {
        prom = new Nit(dir, name, p);
        allNits[p] = prom;
    }
    return prom;
}

function Nit(dir, name, p) {
    this.dir = dir;
    this.name = name;
    this.promise = null;
    this.requires = [];
    var def = $.Deferred();
    var that = this;
    fs.realpath(p, function(er, res) {
        if (er) {
            def.reject(er);
            return;
        }
        that.path = res;
        var mod = require(that.path);
        if (!mod) {
            def.reject("Unable to require", res);
            return;
        }
        that.nit = mod.nit;
        if (!that.nit) {
            def.reject("No exports.nit in", res);
            return;
        }
        // load dependencies
        if (!mod.requires) {
            def.resolve(that);
        } else {
            // requires can either be a string or an array of strings.
            // make it always an array
            var array_req = [].concat(mod.requires);
            whenEver(array_req, function(r) {
                return getNit(dir, r).done(function(n) {
                        that.requires.push(n);
                });
            }).then(function() {
                def.resolve(that);
            }, def.reject);
        }
    });
    return def.promise();
}

Nit.prototype.exec = function(rfc) {
    var that = this;
    if (!that.promise) {
        var $ = rfc.$;
        var def = $.Deferred();
        that.promise = def.promise();

        whenEver(that.requires, function(req) {
            return req.exec(rfc);
        }).done(function(){
            // When all of the pre-reqs have completed, run this nit
            rfc.current_nit = that;
            rfc.log.debug("Running:", that.name);
            //rfc.state();
            $.when(that.nit(rfc)).done(function(){
                def.resolve();
            }).fail(function(){
                def.reject.apply(def, arguments);
            });
        }).fail(function(){
            def.reject.apply(def, arguments);
        });
    }

    return that.promise;
};

Nit.prototype.reset = function() {
    this.promise = null;
};

Nit.prototype.inspect = function() {
    return "Nit<" + this.name + ">";
};

Nit.prototype.dependsOn = function(other) {
    var ret = false;
    this.requires.forEach(function(req) {
        if (ret) {
            return;
        }
        // Note: "==" is intentional here, for once
        if ((other == req) || req.dependsOn(other)) {
            ret = true;
        }
    });
    return ret;
};

Nit.prototype.compare = function(other) {
    if (this.dependsOn(other)) {
        return 1;
    }
    if (other.dependsOn(this)) {
        return -1;
    }
    return this.name.localeCompare(other.name);
};

exports.get = getNit;
exports.sortList = function(list) {
    // Array.sort() won't work since we only have partial ordering.
    // O(n^2) selection sort as a fallback.
    function smallest(start) {
        var s = list[start];
        var idx = start;
        for (var i=start+1; i<list.length; i++) {
            var other = list[i];
            if (s.dependsOn(other)) {
                s = other;
                idx = i;
            }
        }
        return idx;
    }
    for (var j=0; j<list.length; j++) {
        var o = smallest(j);
        if (o !== j) {
            var tmp = list[o];
            list[o] = list[j];
            list[j] = tmp;
        }
    }
};

exports.loadDir = function(dir) {
    var def = $.Deferred();
    var all = [];
    fs.readdir(dir, function(er, files) {
        if (er) {
            def.reject(er);
            return;
        }
        whenEver(files, function(fname) {
            if (!fname.match(/\.js$/)) {
                return null;
            }
            return getNit(dir, fname).done(function(n) {
                all.push(n);
            });
        }).done(function() {
            exports.sortList(all);
            def.resolve(all);
        }).fail(function(er) {
            def.reject(er);
        });
    });
    return def.promise();
};
