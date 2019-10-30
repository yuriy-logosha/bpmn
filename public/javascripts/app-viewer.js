requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app',
        'popper': 'javascripts/popper',
    }
});

requirejs(['jquery', 'bootstrap', 'bpmn-viewer'],
    function   ($, bootstrap, BpmnJS) {
        $.get("/"+diagramUrl, (bpmnXML) => {
            bpmnModeler.importXML(bpmnXML, function (err) {
                if (err) {
                    return console.error('could not import BPMN 2.0 diagram', err);
                }
                var canvas = bpmnModeler.get('canvas');
                var overlays = bpmnModeler.get('overlays');
                canvas.zoom('fit-viewport');
            });
        }, 'text');

        function buildCustomModeler(id) {
            return new BpmnJS({
                container: '#' + id
            });
        }

        var bpmnModeler = buildCustomModeler('canvas');
    });