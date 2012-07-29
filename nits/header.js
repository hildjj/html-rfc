// ensure the html header and its fields are in place, blank if necessary.
exports.nit = function(env) {
/*
    <title>HTML RFC Format</title>
    <meta name='description' content='HTML RFC Format' />
    <meta name='keywords' content='RFC, HTML' />
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
<!-- non-standard, but makes this work for extra devices -->
    <meta name='viewport' content='width=device-width; initial-scale=1.0' />
    <style type='text/css'>
*/
    var $ = env.$;
    var head = $("head");
    if (head.length < 1) {
        head = $(
"<head>" +
  "<title></title>" +
  "<meta name='description' content='None' />" +
  "<meta name='keywords' content='RFC' />" +
  "<meta charset='utf-8' />" +
  "<!-- non-standard, but makes this work for extra devices -->" +
  "<meta name='viewport' content='width=device-width; initial-scale=1.0' />" +
  "<style type='text/css' />" +
"</head>");
        $("html").prepend(head);
    } else {
        if ($("title", head).length < 1) {
            head.append("<title />");
        }
        if ($("meta[name=description]", head).length < 1) {
            head.append("<meta name='description' content='None' />");
        }
        if ($("meta[name=keywords]", head).length < 1) {
            head.append("<meta name='keywords' content='RFC' />");
        }
        var ct = $("meta[charset]", head);
        if (ct.length < 1) {
            head.append("<meta charset='utf-8' />");
        }
        if ($("meta[name='viewport']", head).length < 1) {
            head.comment(" non-standard, but makes this work for extra devices ");
            head.append("<meta name='viewport' content='width=device-width; initial-scale=1.0' />");
        }
        if ($("style", head).length < 1) {
            head.append("<style type='text/css' />");
        }
    }
};
