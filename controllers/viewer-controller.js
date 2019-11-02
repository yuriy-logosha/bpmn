let path = require('path');
let fs = require('fs');

function _getDiagrams() {
    let result = [];

    fs.readdirSync(global.gConfig.uploads)
        .filter(fileName => path.extname(fileName) === '.bpmn')
        .forEach(fileName => result.push(
            {
                'display': fileName.split('.')[0],
                'file': fileName,
                'link': 'files/'+fileName.split('.')[0]
            }
            ));
    return result;
}

function _getGenerated() {
    let result = [];

    fs.readdirSync(global.gConfig.uploads)
        .filter(fileName => path.extname(fileName) === '.py')
        .forEach(fileName => result.push(
            {
                'display': fileName.split('.')[0],
                'file': fileName,
                'link': 'files/'+fileName.split('.')[0]
            }
        ));
    return result;
}

function _getFile (fileName) {
    let filesArr = _getDiagrams();

    return filesArr.find(el => {if(fileName == el.file) return el});
}

module.exports = {
    deleteFile: function(req, res) {
        if(req.method == "DELETE") {
            let fileName = req.body['fileName'];
            if (fileName == '') {
                return res.status(400).send('Empty file name.');
            }

            let file = _getFile(fileName);

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
    getFiles: function () { return _getDiagrams() },
    getFile: function (fileName) { return _getFile(fileName) },
    getGenerated: function () { return _getGenerated() },
};