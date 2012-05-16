var dateformat = require('dateformat');

exports.nit = function(env) {
    var $ = env.$;
    $("div.published").text(dateformat(env.timestamp, "isoDate"));
    var expires = new Date(env.timestamp);
    expires.setMonth(expires.getMonth() + 6);
    $("div.expires").text(dateformat(expires, "isoDate"));
};
