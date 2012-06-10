function Tag(t) {
    this.name = t.nodeName.toLowerCase();
    this.attr = {};
    this.parents = {};
    this.add(t);
}

Tag.prototype.add = function add(t) {
    for (var i=0; i<t.attributes.length; i++) {
        var at = t.attributes[i];
        var nm = at.name.toLowerCase();
        if (["class", "id", "xmlns", "lang"].indexOf(nm) !== -1) {
            continue;
        }
        var cur = this.attr[nm];
        this.attr[nm] = cur ? cur + 1 : 1;
    }
    var parent = t.parentNode;
    if (parent && (parent.nodeType === t.ELEMENT_NODE)) {
        // ignore docs and doc frags
        var nm = parent.nodeName.toLowerCase();
        var cur = this.parents[nm];
        this.parents[nm] = cur ? cur + 1 : 1;
    }
};

Tag.prototype.row = function row($) {
    var tr = $("<tr>");
    $("<td>").text(this.name).appendTo(tr);

    var keys = Object.keys(this.attr).sort();
    $("<td>").text(keys.join(", ")).appendTo(tr);
    keys = Object.keys(this.parents).sort();
    $("<td>").text(keys.join(", ")).appendTo(tr);
    return tr;
};

exports.nit = function tags(env) {
    var $ = env.$;
    var all = {};
    $('*').each(function() {
        var that = $(this);
        if (that.parents("svg").length > 0) {
            return; // continue
        }
        var nm = this.nodeName.toLowerCase();
        var i = all[nm];
        if (!i) {
            all[nm] = new Tag(this);
        } else {
            i.add(this);
        }
    });
    var tbody = $('#html-subset table tbody');
    tbody.empty();
    var keys = Object.keys(all).sort();
    keys.forEach(function(k) {
        tbody.append(all[k].row($));
    });
}
