exports.nit = function(env, onCompletion) { 
    var $ = env.$;
    var i = 0;
    $("p").each(function() {
    	$(this).attr("id", "p" + i);
    	i++;
    });
    onCompletion();
};