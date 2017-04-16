var fs = require('fs');
var express = require('express');
var path = require('path');
var mime = require('mime');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('express-flash');
var handlebars = require('express-handlebars');

//MONGO STUFF
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://35.163.48.45/sandbox');
mongoose.Promise = global.Promise
async = require('async'); 



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('handlebars', handlebars()); app.set('view engine', 'handlebars');

//MULTAR
var multer = require('multer');
var upload = multer({ dest: 'transfers/' });





/**********************************************************************
****************************MOGO FILE UPLOAD STUFF*********************
***********************************************************************/
var filePluginLib = require('mongoose-file');
var filePlugin = filePluginLib.filePlugin;
var make_upload_to_model = filePluginLib.make_upload_to_model;


var transfers_base = path.join(__dirname, "transfers");
var transfers = path.join(transfers_base, "u");

/**********************************************************************
**********************END OF MOGO FILE UPLOAD STUFF********************
***********************************************************************/







app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 180000 }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//flash stuff
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});










//hs schema
var HsSchema = mongoose.Schema({
  title: {
    type: String
  },
  file: {
  }
});


HsSchema.plugin(filePlugin, {
    upload_to: make_upload_to_model(transfers, 'photos'),
    relative_to: transfers_base
});
var Hs = db.model("Hs", HsSchema);
//var Job = module.exports = mongoose.model('Job', jobSchema);














// Route that incorporates flash messages from either req.flash(type) or res.locals.flash
app.get('/', function( req, res ) {
    res.render('index');
});





app.post('/', upload.single('description_file'), function( req, res ) {
        
        console.log('Uploaded File:\n');
        console.log(req.file);
        console.log('\n\n\n');

        var title      = "HsTitleHere";
        var file   = req.file;

        var newHs = new Hs({
          title : title,
          file: file
        });

      
        newHs.save(function(err, hs){
          if(err){
            console.log(err);
            throw err;
          } 
          else{
            console.log('\n\n\ncreated hs:\n'+hs+'\n\n');
          }

        });

        res.send('REceived POST');
});





app.post('/tool', function( req, res ) {
  var dataFile   = req.body.data_file_name;
  console.log('hs dataFileName: '+dataFile);



    res.render('tool', {"dataFileName":dataFile});
});





app.get('/data.json', function(req, res){

  var file = 'transfers/data.json';

  var filename = 'data.json';
  var mimetype = mime.lookup(file);
  console.log('filename: ' + filename + '\nmimetype: '+ mimetype)
  res.setHeader('Content-disposition', 'inline; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});







module.exports = app;

