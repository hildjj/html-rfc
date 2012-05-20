var fs = require('fs');
var path = require('path');
var $ = require('jQuery');

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
            $.when.apply($, array_req.map(function(r){
                return getNit(dir, r).done(function(n) {
                    that.requires.push(n);
                });
            })).then(function() {
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

        var all = [];
        that.requires.forEach(function(req) {
            all.push(req.exec(rfc));
        });
        // When all of the pre-reqs have completed, run this nit
        $.when.apply($, all).done(function(){
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
