requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app'
    }
});

let showError = (text) => {
    $('#error > .toast-body').text(text);
    $('#error').toast('show');
};

let notify = (message) => {
    $('#notify > .toast-body').text(message);
    $('#notify').toast('show');
};

requirejs(['jquery', 'bootstrap.bundle', 'bpmn-modeler'],
    function   ($, bootstrap, BpmnJS) {

        function processMenuItems(items) {
            $('#menu').empty();

            $('#menu').append($("<option selected=\"selected\"></option>"));

            $.each(items, function (index, item) {
                $('#menu').append($("<option></option>").val(item.file).text(item.display))
            });
        }

        function openDiagram(bpmnXML) {
            bpmnModeler.importXML(bpmnXML, function (err) {
                if (err) {
                    return console.error('Could not import BPMN diagram', err);
                }
                var canvas = bpmnModeler.get('canvas');
                var overlays = bpmnModeler.get('overlays');
                canvas.zoom('fit-viewport');
            });
        }

        $('#new-button').click((e) => {
            bpmnModeler.createDiagram();
        });


        $('#save-button').click((e) => {
            bpmnModeler.saveXML({format: true}, function (err, xml) {

                if (err) return console.error('could not save BPMN 2.0 diagram', err);

                let fileName = $("#menu option:selected").text();

                if (fileName === '') return showError("File name can't be empty.");

                if (!confirm('Are you sure you want to save this diagram with name "' + fileName + '"?')) return;

                let data = new FormData();
                data.append(fileName, xml);

                jQuery.ajax({
                    url: window.location,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST', // For jQuery < 1.9
                    success: (data) => notify(data.message),
                    error: (data) => showError(data.responseText)
                });
            });
        });

        $('#new-name').on("keyup", (e) => {
            if (e.keyCode == 13) {
                saveDiagram(e);
                return false;
            }
        });

        $('#save-as-button').click((e) => saveDiagram(e));

        let saveDiagram = () => {

            bpmnModeler.saveXML({format: true}, (err, xml) => {

                if (err) return showError("Could not save BPMN diagram.");

                let fileName = $('#new-name').val();

                if (fileName === '') return showError("File name can't be empty.");

                if (!confirm('Are you sure you want to save this diagram with name "' + fileName + '"?')) return;

                let data = new FormData();
                data.append(fileName, xml);

                jQuery.ajax({
                    url: window.location,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST', // For jQuery < 1.9
                    success: (data) => {
                        $('#menu').val(data.file.file);
                        if ($('#menu').val() === null) {
                            $('#menu').append($("<option></option>").val(data.file.file).text(data.file.display));
                            $('#menu').val(data.file.file);
                        }
                        notify(data.message);
                    },
                    error: (data) => showError(data.responseText)
                });
            });
        };

        function CustomPalette(bpmnFactory, create, elementFactory, palette, translate) {

            this.bpmnFactory = bpmnFactory;
            this.create = create;
            this.elementFactory = elementFactory;
            this.translate = translate;

            palette.registerProvider(this);

            this.getPaletteEntries = function (element) {
                const {
                    bpmnFactory,
                    create,
                    elementFactory,
                    translate
                } = this;

                function createServiceTask(event) {
                    const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});

                    create.start(event, shape);
                }

                return {
                    'create.service-task': {
                        group: 'activity',
                        className: 'bpmn-icon-task red',
                        title: translate('Create ServiceTask'),
                        action: {
                            dragstart: createServiceTask,
                            click: createServiceTask
                        }
                    },
                }
            };
        }

        CustomPalette.$inject = [
            'bpmnFactory',
            'create',
            'elementFactory',
            'palette',
            'translate'
        ];

        function CustomContextPad(config, contextPad, create, elementFactory, injector, translate) {

            this.create = create;
            this.elementFactory = elementFactory;
            this.translate = translate;

            if (config.autoPlace !== false) {
                this.autoPlace = injector.get('autoPlace', false);
            }

            contextPad.registerProvider(this);

            this.getContextPadEntries = function (element) {
                const {
                    autoPlace,
                    create,
                    elementFactory,
                    translate
                } = this;

                function appendServiceTask(event, element) {
                    if (autoPlace) {
                        const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});

                        autoPlace.append(element, shape);
                    } else {
                        appendServiceTaskStart(event, element);
                    }
                }

                function appendServiceTaskStart(event) {
                    const shape = elementFactory.createShape({type: 'bpmn:ServiceTask'});

                    create.start(event, shape, element);
                }

                return {
                    'append.service-task': {
                        group: 'model',
                        className: 'bpmn-icon-service-task',
                        title: translate('Append ServiceTask'),
                        action: {
                            click: appendServiceTask,
                            dragstart: appendServiceTaskStart
                        }
                    }
                };
            };
        }

        CustomContextPad.$inject = [
            'config',
            'contextPad',
            'create',
            'elementFactory',
            'injector',
            'translate'
        ];

        let bpmnModeler = new BpmnJS({
                container: '#canvas',
                keyboard: {
                    bindTo: window
                }
            });

        let newItemName = '!{getNew()}';

        bpmnModeler.createDiagram();

        $('#delete-button').click(() => {
            var fileName = $("#menu option:selected").val();
            $.ajax({
                url: window.location,
                type: 'DELETE',
                data: {fileName: fileName},
                success: function (response) {
                    if (response.response === 'success'){
                        $.getJSON('/files', processMenuItems);
                        bpmnModeler.createDiagram();
                        $('#deleted > .toast-header > strong').text(fileName);
                        $('#deleted').toast('show');
                    }
                },
                error: (data) => showError(data.responseText)
            });
        })

        $('#menu').change(() => {
            const diagramName = $("#menu option:selected").val();

            if (diagramName == '') return;

            $('#menu option')
                .filter(function() {
                    return !this.value || $.trim(this.value).length == 0 || $.trim(this.text).length == 0;
                })
                .remove();

            $.get(diagramName, openDiagram, 'text');
        });

        $('#download-button').click((e) => {
            fetch(window.location+$("#menu option:selected").text()+'.py')
                .then(resp => resp.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // the filename you want
                    a.download = $("#menu option:selected").text()+'.py';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(() => showError(data.responseText));
        });


        $.getJSON('/files', processMenuItems);
    });