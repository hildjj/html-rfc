var qs = require('querystring');

exports.nit = function formula(env) {
    var $ = env.$;

    $("img.formula[alt]").each(function() {
        var that = $(this);
        var alt = that.attr('alt');
        if (!alt || that.attr('src')) {
            return;
        }
        // todo: pull down a png and name it with the hash of the alt, like websequencediagrams.
        var q = {cht: 'tx', chl: alt};

        // always let Google calculate the width.
        var h = that.attr('height');
        if (h) {
            q['chs'] = h;
        }
        that.attr('src', 'http://chart.googleapis.com/chart?' + qs.stringify(q));
    });
}
