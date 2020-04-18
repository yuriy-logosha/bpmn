var common = require('../common');
var express = require('express');
let path = require('path');
var router = express.Router({strict: false});
var viewerController = require('../controllers/viewer-controller');

var multer  = require('multer');
var upload = multer({ dest: global.gConfig.uploads });
var fs = require('fs');

router.get('/', function (req, res, next) {
    res.render('bpmn-model', viewerController);
});

router.post('/', upload.single('file'), function (req, res) {

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    Object.keys(req.body).forEach(function(fileName){

        if(!common.isValidFileName(fileName)) {
            return res.status(400).send("Wrong file name!");
        }

        fs.writeFile(path.join(global.gConfig.uploads, fileName+".bpmn"), req.body[fileName], 'utf8', (err) => {
            if (err)
                return res.status(400).send("Wrong file name!");
            return res.status(200).send({message: 'File ' + fileName + ' successfully saved!', file: viewerController.getFile(fileName+".bpmn")});
        });
    })
});

router.delete('/', viewerController.deleteFile);

router.get('/files/:filename', function (req, res, next) {
    res.render('bpmn-view', {diagram: req.params.filename});
});

router.get('/files', function (req, res, next) {
    res.json(viewerController.getFiles());
});

router.get('/generated', function (req, res, next) {
    res.json(viewerController.getGenerated());
});

router.get('/generated/:filename', function (req, res, next) {
    res.render('py-view', {pyfile: req.params.filename});
});

module.exports = router;
