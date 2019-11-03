requirejs.config({
    baseUrl: '/javascripts',
    paths: {
        'app': 'app'
    }
});


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

                if (err) {
                    return console.error('could not save BPMN 2.0 diagram', err);
                }

                let fileName = $("#menu option:selected").text();

                if (fileName === newItemName || fileName === '') {
                    alert("File name can't be empty.");
                    return;
                }

                if (!confirm('Are you sure you want to save this diagram with name "' + fileName + '"?')) {
                    return;
                }

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
                    success: function (data) {
                        $('#notify > .toast-body').text(data.message);
                        $('#notify').toast('show');
                    },
                    error: function (data) {
                        $('#error > .toast-body').text(data.responseText);
                        $('#error').toast('show');
                    }
                });
            });
        });

        $('#save-as-button').click((e) => {

            bpmnModeler.saveXML({format: true}, function (err, xml) {

                if (err) {
                    return console.error('Could not save BPMN diagram', err);
                }

                var fileName = $('#new-name').val();

                if (fileName === '') {
                    alert("File name can't be empty.");
                    return;
                }

                if (!confirm('Are you sure you want to save this diagram with name "' + fileName + '"?')) {
                    return;
                }

                var data = new FormData();
                data.append(fileName, xml);

                jQuery.ajax({
                    url: window.location,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST', // For jQuery < 1.9
                    success: function (data) {
                        $('#menu').val(data.file.file);
                        if ($('#menu').val() === null) {
                            $('#menu').append($("<option></option>").val(data.file.file).text(data.file.display));
                            $('#menu').val(data.file.file);
                        }
                        $('#notify > .toast-body').text(data.message);
                        $('#notify').toast('show');
                    },
                    error: function (data) {
                        $('#error > .toast-body').text(data.responseText);
                        $('#error').toast('show');
                    }
                });
            });
        });

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

        // let BaseRenderer = require('BaseRenderer').default;

        // class CustomRenderer extends BaseRenderer {
        //     constructor(eventBus, bpmnRenderer) {
        //         super(eventBus, HIGH_PRIORITY);
        //
        //         this.bpmnRenderer = bpmnRenderer;
        //     }
        //
        //     canRender(element) {
        //
        //         // ignore labels
        //         return !element.labelTarget;
        //     }
        //
        //     drawShape(parentNode, element) {
        //         const shape = this.bpmnRenderer.drawShape(parentNode, element);
        //
        //         const suitabilityScore = this.getSuitabilityScore(element);
        //
        //         if (!isNil(suitabilityScore)) {
        //             const color = this.getColor(suitabilityScore);
        //
        //             const rect = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);
        //
        //             svgAttr(rect, {
        //                 transform: 'translate(-20, -10)'
        //             });
        //
        //             var text = svgCreate('text');
        //
        //             svgAttr(text, {
        //                 fill: '#fff',
        //                 transform: 'translate(-15, 5)'
        //             });
        //
        //             svgClasses(text).add('djs-label');
        //
        //             svgAppend(text, document.createTextNode(suitabilityScore));
        //
        //             svgAppend(parentNode, text);
        //         }
        //
        //         return shape;
        //     }
        //
        //     getShapePath(shape) {
        //         if (is(shape, 'bpmn:Task')) {
        //             return getRoundRectPath(shape, TASK_BORDER_RADIUS);
        //         }
        //
        //         return this.bpmnRenderer.getShapePath(shape);
        //     }
        //
        //     getSuitabilityScore(element) {
        //         const businessObject = getBusinessObject(element);
        //
        //         const {suitable} = businessObject;
        //
        //         return Number.isFinite(suitable) ? suitable : null;
        //     }
        //
        //     getColor(suitabilityScore) {
        //         if (suitabilityScore > 75) {
        //             return COLOR_GREEN;
        //         } else if (suitabilityScore > 25) {
        //             return COLOR_YELLOW;
        //         }
        //
        //         return COLOR_RED;
        //     }
        // }
        //
        // CustomRenderer.$inject = ['eventBus', 'bpmnRenderer'];
        //
        // function drawRect(parentNode, width, height, borderRadius, color) {
        //     const rect = svgCreate('rect');
        //
        //     svgAttr(rect, {
        //         width: width,
        //         height: height,
        //         rx: borderRadius,
        //         ry: borderRadius,
        //         stroke: color,
        //         strokeWidth: 2,
        //         fill: color
        //     });
        //
        //     svgAppend(parentNode, rect);
        //
        //     return rect;
        // }
        //
        //



        var bpmnModeler = new BpmnJS({
                container: '#canvas',
                keyboard: {
                    bindTo: window
                }
                ,
                // additionalModules: [
                //     {
                //         contextPadProvider: [ 'type', CustomContextPad ],
                //         customPalette: [ 'type', CustomPalette ]
                //         ,
                //         customRenderer: [ 'type', CustomRenderer ]
                //     }
                // ]
            });

        var newItemName = '!{getNew()}';

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
                error: function (data) {
                    $('#error > .toast-body').text(data.responseText);
                    $('#error').toast('show');
                }
            });
        })

        $('#menu').change(function () {
            const diagramName = $("#menu option:selected").val();

            if (diagramName == '') {
                return;
            }
            $('#menu option')
                .filter(function() {
                    return !this.value || $.trim(this.value).length == 0 || $.trim(this.text).length == 0;
                })
                .remove();

            $.get(diagramName, openDiagram, 'text');

            $('#get_py_button_container').attr("href", $("#menu option:selected").text()+'.py');

        });

        $.getJSON('/files', processMenuItems);
    });