requirejs(['jquery', 'bpmn-modeler'], function   ($, BpmnJS) {

    function processMenuItems(items) {
        $('#menu').empty();

        $.each(items, function (index, item) {
            $('#menu').append($("<option></option>").val(item.file).text(item.display))
        });
    }

    function openDiagram(bpmnXML) {
        bpmnModeler.importXML(bpmnXML, function (err) {
            if (err) {
                return console.error('could not import BPMN 2.0 diagram', err);
            }
            var canvas = bpmnModeler.get('canvas');
            var overlays = bpmnModeler.get('overlays');
            canvas.zoom('fit-viewport');
        });
        //bpmnModeler.addCustomElements(customElements);
    }

    function saveDiagram(e) {

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
                    alert(data.message);
                },
                error: function (data) {
                    alert(data.responseText);
                }
            });
        });
    }

    function saveAsDiagram(e) {

        bpmnModeler.saveXML({format: true}, function (err, xml) {

            if (err) {
                return console.error('could not save BPMN 2.0 diagram', err);
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
                    alert(data.message);
                },
                error: function (data) {
                    alert(data.responseText);
                }
            });
        });
    }

    function buildCustomModeler(id) {
        return new BpmnJS({
            container: '#' + id,
            keyboard: {
                bindTo: window
            }
        });
    }


    var newItemName = '!{getNew()}';

    var bpmnModeler = buildCustomModeler('canvas');

    bpmnModeler.createDiagram();

    $('#save-button').click(saveDiagram);

    $('#save-as-button').click(saveAsDiagram);

    $('#delete-button').click(deleteDiagram);

    function deleteDiagram() {
        var fileName = $("#menu option:selected").val();
        $.ajax({
            url: window.location,
            type: 'DELETE',
            data: {fileName: fileName},
            success: function (response) {
                $.getJSON('/files', processMenuItems);
            },
            error: function (data) {
                alert(data.responseText);
            }
        });
    }

    $('#menu').change(function () {
        var diagramUrl = $("#menu option:selected").val();

        if (diagramUrl == '') {
            bpmnModeler.createDiagram();
        } else {
            $.get(diagramUrl, openDiagram, 'text');
        }
    });

    $.getJSON('/files', processMenuItems);



});