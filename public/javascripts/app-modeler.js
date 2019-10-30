requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app',
        'popper': 'javascripts/popper',
    }
});

requirejs(['jquery', 'bootstrap', 'modeler'],
    function   ($, b, m) {

    });