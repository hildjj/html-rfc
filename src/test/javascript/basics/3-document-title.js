exports.nit = function(environment) {
    console.log('original doc title: ' + environment.document.title);
    environment.document.title = 'Hello from lint!';
    console.log('updated doc title: ' + environment.document.title);
};