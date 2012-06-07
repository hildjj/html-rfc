var abnf = require('abnf');

exports.nit = function check_abnf(env) {
    var $ = env.$;
    var str = $(".language-abnf").text();

    if (str.length > 0) {
        var def = $.Deferred();
        abnf.Parse(str, function(er, rules) {
            if (er) {
                env.log.warn("Parse error at line:", rules.line);
                def.reject(er, rules.line, rules);
                return;
            }
            rules.refs.forEach(function(ref) {
                if (!rules.defs.hasOwnProperty(ref.name.toUpperCase())) {
                    env.log.warn("Unknown reference: '" + ref.name + "' at ABNF line " + ref.line);
                }
            });
            def.resolve(rules);
        });
        return def.promise();
    }

    return undefined;
}
