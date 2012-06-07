function sort_list($, ul) {
    var li = $("li", ul);
}

exports.nit = function sort_refs(env) {
    var $ = env.$;
    $("#references #normative ul>li").tsort({attr:"id"});
    $("#references #informative ul>li").tsort({attr:"id"});
}

exports.requires = ["inline-refs.js", "refs.js"];
