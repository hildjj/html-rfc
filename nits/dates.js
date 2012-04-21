function pad(num) {
    return ("0" + num).slice(-2);
}
function stamp(ts) {
    return ts.getFullYear() + "-" + pad(ts.getMonth()+1) + "-" + pad(ts.getDate())
}
exports.nit = function(env) {
    var $ = env.$;
    $("div.published").text(stamp(env.timestamp));
    var expires = new Date(env.timestamp);
    expires.setMonth(expires.getMonth() + 6);
    $("div.expires").text(stamp(expires));
}
