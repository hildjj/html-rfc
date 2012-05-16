// ensure there is an abstract
exports.nit = function(env) {
    var $ = env.$;
    var abstract = $("div#abstract");
    if (abstract.length === 0) {
        env.log.warn("No Abstract.  Adding one that needs to be edited.")
        $("div#title").after($("<div id='abstract'><h2>Abstract</h2><p>An abstract.</p></div>"));
    }
}

exports.requires = "title.js";
