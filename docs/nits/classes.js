function Class(nm) {
    this.name = nm;
    this.elems = [];
}

Class.prototype.add = function add(el) {
    var nm = el[0].nodeName.toLowerCase();
    if (this.elems.indexOf(nm) === -1) {
        this.elems.push(nm);
    }
};

Class.prototype.row = function row($) {
    return $("<tr><td>" + this.name + "</td><td> </td></tr>");
}

exports.nit = function classes(env) {
    var $ = env.$;
    var all = {};
    $('*[class]').each(function() {
        var that = $(this);
        var cls = that.attr('class');
        if (cls) {
            cls.split(" ").forEach(function(nm) {
                var i = all[nm];
                if (!i) {
                    all[nm] = i = new Class(nm);
                }
                i.add(that);
            });
        }
    });

    var tbody = $('#html-classes table tbody');
    tbody.empty();
    var keys = Object.keys(all).sort();
    keys.forEach(function(k) {
        tbody.append(all[k].row($));
    });
};
