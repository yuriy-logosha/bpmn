requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app',
        'popper': 'javascripts/popper',
    }
});

requirejs(['jquery', 'bootstrap', 'modeler-common'],
    function   ($) {

    });