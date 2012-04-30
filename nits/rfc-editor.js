exports.nit = function(env) {
    $ = env.$;
    if (env.argv['rfc-editor']) {
        $(".rfceditor-remove").remove();
    }
};
