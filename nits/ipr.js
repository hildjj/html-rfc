var dateformat = require('dateformat');

var TLPs = {
    'trust200902':
        ["", ""],
    'noModificationTrust200902':
        ["  This document may not be modified, and derivative works of it may not be created, except to format it for publication as an RFC or to translate it into languages other than English.",
         ""],
    'noDerivativesTrust200902':
        ["  This document may not be modified, and derivative works of it may not be created, and it may not be published except as an Internet-Draft.",
         ""],
    'pre5378Trust200902':
        ["",
         "<p>This document may contain material from IETF Documents or IETF Contributions published or made publicly available before November 10, 2008.  The person(s) controlling the copyright in some of this material may not have granted the IETF Trust the right to allow modifications of such material outside the IETF Standards Process. Without obtaining an adequate license from the person(s) controlling the copyright in such materials, this document may not be modified outside the IETF Standards Process, and derivative works of it may not be created outside the IETF Standards Process, except to format it for publication as an RFC or to translate it into languages other than English.</p>"]
}

exports.nit = function(env) {
    var $ = env.$;
    var ipr = $("div#ipr");
    if (ipr.length === 0) {
        env.log.warn("No IPR statement.  Adding trust200902.");
        ipr = $("<div id='ipr' class='trust200902' />");
        $("div#abstract").after(ipr);
    }
    ipr.empty();
    var tlp = TLPs[ipr.attr('class')];
    if (tlp === undefined) {
        env.log.warn("Invalid IPR type: '%s', changing to trust200902.", ipr.attr('class'));
        tlp = TLPs['trust200902'];
        ipr.attr('class', 'trust200902');
    }
    ipr.append($("<h2>Status of this Memo</h2>"));
    ipr.append($("<p>This Internet-Draft is submitted in full conformance with the provisions of <a class='ref' href='#rfc:5378'>BCP 78</a> and <a class='ref' href='#rfc:3979'>BCP 79</a>." +
                 tlp[0] + "</p>"));
    ipr.append("<p>Internet-Drafts are working documents of the Internet Engineering Task Force (IETF).  Note that other groups may also distribute working documents as Internet-Drafts.  The list of current Internet-Drafts is at <a href='http://datatracker.ietf.org/drafts/current/'>http://datatracker.ietf.org/drafts/current/</a>.</p>");
    ipr.append("<p>Internet-Drafts are draft documents valid for a maximum of six months and may be updated, replaced, or obsoleted by other documents at any time.  It is inappropriate to use Internet-Drafts as reference material or to cite them other than as \"work in progress.\"</p>");

    var expires = new Date(env.timestamp);
    expires.setMonth(expires.getMonth() + 6);
    ipr.append("<p>This Internet-Draft will expire on {DATE}.</p>".replace(/\{DATE\}/g, dateformat(expires, "mmmm dd, yyyy")));

    ipr.append("<h2>Copyright Notice</h2>");
    ipr.append("<p>Copyright &#xa9; " + dateformat(env.timestamp, 'yyyy') +
               " IETF Trust and the persons identified as the document authors.  All rights reserved.</p>");
    ipr.append("<p>This document is subject to <a class='ref' href='#rfc:5378'>BCP 78</a> and the IETF Trust's Legal Provisions Relating to <a href='http://trustee.ietf.org/license-info'>IETF Documents</a> in effect on the date of publication of this document.  Please review these documents carefully, as they describe your rights and restrictions with respect to this document.  Code Components extracted from this document must include Simplified BSD License text as described in Section 4.e of the Trust Legal Provisions and are provided without warranty as described in the Simplified BSD License.</p>");
    if (tlp[1].length > 0){
        ipr.append(tlp[1]);
    }
}

exports.requires = "abstract.js";

