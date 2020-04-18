requirejs.config({
    baseUrl: '/javascripts',
    packages: [{
        name: "codemirror",
        location: "/cm",
        main: "lib/codemirror"
      }]
});

requirejs(['jquery', 'bootstrap.bundle', 'codemirror', 'cm/mode/python/python'],
    function   ($, bootstrap, CodeMirror) {
        $.get("/"+pyfile+".py", (content) => {
            $('#canvas').text(content);
            CodeMirror.fromTextArea(document.getElementById("canvas"), {
                // value: content,
                lineNumbers: true,
                mode: "python"
              });
        }, 'text');

    });