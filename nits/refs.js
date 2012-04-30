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

exports.nit = function(env) {
    var $ = env.$;
    var prom = [];

    // all references that haven't been filled in
    $(".ref:empty").each(function() {
        var ref = $(this);
        var id = ref.attr("id");

        if (!id) {
            return env.error("no id");
        }
        var matches = id.match(/^(\w+):(.*)/);
        if (!matches) {
            return env.error("bad id");
        }
        var series = matches[1].toLowerCase();
        var u = refmap[series];
        if (!u) {
            return env.error("bad series");
        }
        id = matches[2];
        // RFC's and XEP's are 4 digits
        if (id.match(/^\d{1,3}$/)) {
            id = ("0000" + id).slice(-4);
        }

        u = u.replace(/\{id\}/, id);
        env.log.info("Getting " + series + ":", id, "(" + u + ")");

        prom.push($.get(u)
                        .done(function(data){
                            var anchor = $('reference', data).attr('anchor');
                            $('<span>').attr('id', anchor).text("[" + anchor + "]").appendTo(ref);
                            var author = $('<span>').addClass('author').appendTo(ref);
                            var nm = $('author', data).attr('surname') + ", " + $('author', data).attr('initials');
                            var mailto = $("author email", data).text();
                            var org = $("author organization", data).text();
                            if (mailto || org) {
                                $('<a>')
                                    .attr('href', 'mailto:' + $("author email", data).text())
                                    .attr('title', $("author organization", data).text())
                                    .text(nm)
                                    .appendTo(author);
                            } else {
                                author.append(nm);
                            }

                            $('<span>').text(',').appendTo(ref);
                            $('<span>').addClass('title').text('"' + $('title', data).text() + '"')
                                .appendTo(ref);

                            var reflinks = $('<span>').addClass('reflinks').appendTo(ref);
                            $('format', data).each(function() {
                                var fmt = $(this);
                                $('<span>')
                                    .append('[')
                                    .append($('<a>').attr('href', fmt.attr('target')).text(fmt.attr('type')))
                                    .append(']')
                                    .appendTo(reflinks);
                            });
                            $('<span>').text(',').appendTo(ref);
                            var series = [];
                            $('seriesInfo', data).each(function() {
                                var t = $(this);
                                series.push(t.attr('name') + "\u00a0" + t.attr('value'));
                            });
                            $('<span>')
                                .addClass('series-info')
                                .text(series.join(', '))
                                .appendTo(ref);
                            $('<span>').text(',').appendTo(ref);
                            $('<span>')
                                .addClass('date')
                                .text($('date', data).attr('month') + "\u00a0" + $('date', data).attr('year'))
                                .appendTo(ref);
                            $('<span>').text('.').appendTo(ref);
                        }));
    });
    return $.when.apply($, prom);
};
