function enc(s) {
    return s.replace(/[<>&]/g, function(c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\u00a0': return '&#xa0;';
            default:
                throw 'Bad regex';
        }
        throw 'Bad regex';
    });
}

function cmt(c, indent, mix, w, settings) {
    w("<!--", c.nodeValue, "-->\n");
}

function txt(t, indent, mix, w, settings) {
    var v = t.nodeValue;
    // if no indent, we're in a pre tag, e.g.
    if (indent) {
        if (mix) {
            v = v.replace(/\s+/g, " ");
        } else {
            v = v.trim();
        }
    }
    if (v) {
        w(mix ? null : indent, enc(v), mix ? null : "\n");
    }
}

function hasText(e) {
    if (!e) {
        return false;
    }
    var elen = e.childNodes.length;
    for (var i=0; i<elen; i++) {
        var n = e.childNodes[i];
        if (n.nodeType === e.TEXT_NODE) {
            if (n.value.trim()) {
                return true;
            }
        }
    }
    return false;
}

// TODO: merge this with elem.
function output(n, indent, mix, w, settings) {
    switch (n.nodeType) {
    case n.ELEMENT_NODE:
        elem(n, indent, mix, w, settings);
        break;
    case n.TEXT_NODE:
        var ename = null;
        if (n.parentNode) {
            ename = n.parentNode.nodeName.toLowerCase();
        }
        if (["pre"].indexOf(ename) === -1) {
            txt(n, indent, mix, w, settings);
        } else {
            txt(n, "", mix, w, settings);
        }

        break;
    case n.COMMENT_NODE:
        cmt(n, indent, mix, w, settings);
        break;
    case n.DOCUMENT_NODE:
        if (n.doctype) {
            w(n.doctype.toString(), '\n');
        } else {
            w("<!DOCTYPE html>\n");
        }
        if (n.documentElement) {
            elem(n.documentElement, "", false, w, settings);
        } else {
            for (var i=0; i<n.childNodes.length; i++) {
                output(n.childNodes[i], "", false, w, settings);
            }
        }
        break;
    default:
        w("UNKNOWN nodeType: ", c.nodeType);
        break;
    }
}

function elem(e, indent, mix, w, settings) {
    var ename = e.nodeName.toLowerCase();
    w(mix ? null : indent, "<", ename);
    var i;
    for (i=0; i<e.attributes.length; i++) {
        var att = e.attributes[i];
        w(" ", enc(att.name.toLowerCase()), "='", enc(att.value), "'");
    }
    var elen = e.childNodes.length;
    if (elen === 0) {
        w(" />", mix ? null : "\n");
    } else {
        var m = mix || hasText(e);
        w(">", m ? null : "\n");
        for (i=0; i<elen; i++) {
            var c = e.childNodes[i];
            switch (c.nodeType) {
            case e.ELEMENT_NODE:
                elem(c, indent+settings.indent, m, w, settings);
                break;
            case e.TEXT_NODE:
                if (["pre"].indexOf(ename) === -1) {
                    txt(c, indent+settings.indent, m, w, settings);
                } else {
                    txt(c, "", m, w, settings);
                }

                break;
            case e.COMMENT_NODE:
                cmt(c, indent+settings.indent, m, w, settings);
                break;
            default:
                throw "Unknown node type";
            }
        }

        w(m || mix ? null : indent, "</", ename, ">", mix ? null : "\n");
    }
}

function pretty(doc, stream, settings) {
    if (!stream) {
        stream = process.stdout;
    }
    if (!settings) {
        settings = {};
    }
    if (!('indent' in settings)) {
        settings.indent = "  ";
    }

    var w = function() {
        var i;
        var len = 0;
        for (i=0; i<arguments.length; i++) {
            var a = arguments[i];
            if (a) {
                len += a.length;
                stream.write(a);
            }
        }
    };

/*
    if (doc.doctype) {
        w(doc.doctype.toString(), '\n');
    } else {
        w("<!DOCTYPE html>\n");
    }

    elem(doc.documentElement, "", false, w, settings);
    */
    if (!doc) {
        w("NULL\n");
    } else if (typeof(doc) === "string") {
        w(doc, "\n");
    } else {
        output(doc, "", false, w, settings);
    }
}

exports.pretty = pretty;
