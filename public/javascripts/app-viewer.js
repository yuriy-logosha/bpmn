requirejs.config({
    baseUrl: '/javascripts'
});

requirejs(['jquery', 'bootstrap.bundle', 'bpmn-viewer'],
    function   ($, bootstrap, BpmnJS) {
        $.get("/"+diagram+".bpmn", (bpmnXML) => {
            var bpmnModeler = new BpmnJS({
                container: '#canvas'
            });
            bpmnModeler.importXML(bpmnXML, function (err) {
                if (err) {
                    return console.error('could not import BPMN 2.0 diagram', err);
                }
            });
            bpmnModeler.get('canvas').zoom('fit-viewport');
        }, 'text');

    });