requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app',
        'popper': 'javascripts/popper',
    }
});

requirejs(['jquery', 'bootstrap', 'viewer'],
    function   ($, b, m) {

    });