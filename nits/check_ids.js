exports.nit = function check_ids(env) {
    // make sure that all id's are unique

    var $ = env.$;
    var ids = {};
    $("*[id!='']").each(function() {
        var id = $(this).attr('id');
        if (ids.hasOwnProperty(id)) {
            env.log.error("Duplicate ID:", id);
            ids[id] += 1;
        } else {
            ids[id] = 1;
        }
    });
}

exports.requires = ["p-number.js", "div-number.js", "toc.js"];
