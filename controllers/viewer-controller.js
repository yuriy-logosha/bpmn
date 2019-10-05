var path = require('path');
var fs = require('fs');

var newFile = 'New...';

function createEmptyItem() {
    return {display: newFile, file:''};
}

function _getFiles() {
    let result = [createEmptyItem()];

    fs.readdirSync(global.gConfig.uploads)
        .filter(fileName => path.extname(fileName) === '.bpmn')
        .forEach(fileName => result.push({'display': fileName.split('.')[0], 'file': fileName}));
    return result;
}

function _getFile (fileName) {
    var filesArr = _getFiles();

    return filesArr.find(el => {if(fileName == el.file) return el});
}

module.exports = {
    deleteFile: function(req, res) {
        if(req.method == "DELETE") {
            let fileName = req.body['fileName'];
            if (fileName == '') {
                return res.status(400).send('Empty file name.');
            }

            var file = _getFile(fileName);

            if (!file || !file.hasOwnProperty('file')){
                return res.status(400).send('Wrong file name.');
            }

            fs.unlink(global.gConfig.uploads + '/' + file.file, function() {
                return res.send ({
                    status: "200",
                    responseType: "string",
                    response: "success"
                });
            });
        }
    },
    getNew: function() { return newFile },
    getFiles: function () { return _getFiles() },
    getFile: function (fileName) { return _getFile(fileName) }
};