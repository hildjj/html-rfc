var refmap = {
    "3gpp"  : "http://xml.resource.org/public/rfc/bibxml5/reference.3GPP.{id}.xml",
    "ansi"  : "http://xml.resource.org/public/rfc/bibxml2/reference.ANSI.{id}.xml",
    "ccitt" : "http://xml.resource.org/public/rfc/bibxml2/reference.CCITT.{id}.xml",
    "fips"  : "http://xml.resource.org/public/rfc/bibxml2/reference.FIPS.1-1.1980.xml",
    "id"    : "http://xml.resource.org/public/rfc/bibxml3/reference.I-D.{id}.xml",
    "ieee"  : "http://xml.resource.org/public/rfc/bibxml2/reference.IEEE.{id}.xml",
    "iso"   : "http://xml.resource.org/public/rfc/bibxml2/reference.ISO.{id}.xml",
    "itu"   : "http://xml.resource.org/public/rfc/bibxml2/reference.ITU.{id}.xml",
    "nist"  : "http://xml.resource.org/public/rfc/bibxml2/reference.NIST.{id}.xml",
    "oasis" : "http://xml.resource.org/public/rfc/bibxml2/reference.OASIS.{id}.xml",
    "pkcs"  : "http://xml.resource.org/public/rfc/bibxml2/reference.PKCS.{id}.xml",
    "rfc"   : "http://xml.resource.org/public/rfc/bibxml/reference.RFC.{id}.xml",
    "w3c"   : "http://xml.resource.org/public/rfc/bibxml4/reference.W3C.{id}.xml",
    "xep"   : "http://xmpp.org/extensions/refs/reference.XSF.XEP-{id}.xml",
    "other" : "{id}"
};

function surname(author) {
    var sur = $('<span>').addClass('surname');
    var mailto = $("email", author).text();
    var org = $("organization", author).text();

    if (mailto || org) {
        var a = $('<a>');
        if (mailto) {
            a.attr('href', 'mailto:' + mailto)
        }
        if (org) {
            a.attr('title', org);
        }
        a.text(author.attr('surname')).appendTo(sur);
    } else {
        sur.append(author.attr('surname'));
    }
    return sur;
}

function author(author, first) {
    var a = $(author);
    var auth = $('<span>').addClass('author');
    var initials = $('<span>').addClass('initials').text(a.attr('initials'));

    if (first) {
        auth.append(surname(a));
        auth.append(", ");
        auth.append(initials);
    } else {
        auth.append(initials);
        auth.append(" ");
        auth.append(surname(a));
    }

    if (a.attr('role') === 'editor') {
        author.append(", ");
        $("<span>").addClass('role').text("Ed.").appendTo(auth);
    }
    return auth;
}

exports.nit = function(env) {
    var $ = env.$;
    var prom = [];

    // TODO: Sort refs by series, then number.
    // TODO: support div.inforef

    // all references that haven't been filled in
    $("#references li:empty").each(function() {
        var ref = $(this);
        var id = ref.attr("id");

        if (!id) {
            return env.error("no id");
        }
        var matches = id.match(/^(\w+):(.*)/);
        if (!matches) {
            return env.error("bad id", id);
        }
        var series = matches[1].toLowerCase();
        var u = refmap[series];
        if (!u) {
            return env.error("bad series: " + series);
        }
        id = matches[2];
        // RFC's and XEP's are 4 digits
        if (id.match(/^\d{1,3}$/)) {
            id = ("0000" + id).slice(-4);
        }

        u = u.replace(/\{id\}/, id);
        env.log.info("Getting", series, id, "(" + u + ")");

        prom.push($.get(u)
                        .done(function(data, status, x) {
                            if (status !== "success") {
                                return;
                            }

                            ref.empty();
                            if (!env.argv['final']) {
                                var h = x.responseText.replace(/^<\?xml version='1\.0' encoding='UTF-8'\?>\s*/, "");
                                ref.attr('data-xml', h);
                                //var h = $("<p>").append(data.eq(0).clone()).html();
                                //env.log.debug(h);
                                //ref.attr('data-xml', h);
                            }
                            var anchor = $('reference', data).attr('anchor');
                            ref.append("[")
                            $('<span>').attr('id', anchor).text(anchor).appendTo(ref);
                            ref.append("] ");
                            var authors = $('author', data);
                            switch (authors.length) {
                                case 0:
                                    // some sort of fouled up input
                                    env.log.warn("No authors in reference: " + anchor);
                                    return;
                                case 1:
                                    author(authors[0], true).appendTo(ref);
                                    break;
                                case 2:
                                    // Preston, W. and T. Logan
                                    author(authors[0], true).appendTo(ref);
                                    ref.append(" and ")
                                    author(authors[1], false).appendTo(ref);
                                    break;
                                default:
                                    // Howard, M., C. Howard, and L. Fine
                                    author(authors[0], true).appendTo(ref);
                                    for (var i=1; i<authors.length; i++) {
                                        ref.append(", ");
                                        if (i == (author.length-1)) {
                                            ref.append("and ");
                                        }
                                        author(authors[i], false).appendTo(ref);
                                    }
                                    break;
                            }
                            ref.append(', "');
                            $('<span>').addClass('title').text($('title', data).text())
                                .appendTo(ref);
                            ref.append('", ');
                            var reflinks = $('<span>').addClass('reflinks').appendTo(ref);
                            $('format', data).each(function() {
                                var fmt = $(this);
                                var af = $('<a>')
                                    .attr('href', fmt.attr('target'))
                                    .text(fmt.attr('type'));
                                var octets = fmt.attr('octets');
                                if (octets) {
                                    af.attr('title',  octets + " octets");
                                }
                                $('<span>')
                                    .append(' [')
                                    .append(af)
                                    .append(']')
                                    .appendTo(reflinks);
                            });
                            ref.append(", ");
                            var series = [];
                            $('seriesInfo', data).each(function() {
                                var t = $(this);
                                series.push(t.attr('name') + "\u00a0" + t.attr('value'));
                            });
                            $('<span>')
                                .addClass('series-info')
                                .text(series.join(', '))
                                .appendTo(ref);
                            ref.append(", ");
                            $('<span>')
                                .addClass('date')
                                .text($('date', data).attr('month') + "\u00a0" + $('date', data).attr('year'))
                                .appendTo(ref);
                            ref.append(".");
                        }));
    });
    return $.when.apply($, prom);
};

exports.requires = 'inline-refs.js';
