/**
 * Module dependencies.
 */
var express = require('express'),
  http = require('http'),
  path = require('path'),
  picsee = require('./picsee');

// Picsee options
var root = __dirname + '/public/';
// For the sake of demo, keeping "staging" local to app,
// but PLEASE change this for your app for security reasons.
var staging = root + 'images/staging/';
var processing = 'images/processing/';
var uploaded = 'images/uploaded/';
//var original = 'images/original/';
var original = false;


function getLocalIP() {
    var os = require('os');
    var IPv4, hostName;
    hostName = os.hostname();
    for (var i = 0; i < os.networkInterfaces().eth0.length; i++) {
        if (os.networkInterfaces().eth0[i].family == 'IPv4') {
            IPv4 = os.networkInterfaces().eth0[i].address;
        }
    }
    return IPv4;
}


var options = {
    docRoot: root,
    urlRoot: 'http://test.dspay.org:3000/',
    stagingDir: staging,
    processDir: processing,
    uploadDir: uploaded,
    originalDir: original,
    versions: [
        {
            'thmb': {
                w: 480,
                h: null
            }
        }
    ],
    separator: '_',
    directories: 'single',
    namingConvention: 'date',
    inputFields: ['profPhoto', 'other']
};

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  /**
   * Initialize picsee
   */
  picsee.initialize(options);
});

app.configure('production', function() {
  app.use(express.errorHandler());
});


/**
 * Show Form
 */
app.get('/', function(req, res, next) {
    res.end('server is working');
});


/**
 * Handle Upload and show Crop Form, or if err, return to Upload
 */
app.post('/upload', function (req, res, next) {
    picsee.upload(req, res, function (err, results) {
        if (err) res.end('0');
//        console.dir(results);
        if (results == null || results[0] == null || results[0].original == null) {
            res.end('0');
        } else {
            var original = results[0].original.name || false;
            req.body.image = results[0].path;
            req.body.original = results[0].original.name;
            picsee.crop(req, res, function (err, results) {
                if (err) res.end('0');
                res.end(results[0].url);
            });
        }
    });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
