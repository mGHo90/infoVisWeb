/*******************************************************************
****************Middle Ware Declarations****************************
*******************************************************************/
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
var exphbs = require('express-handlebars');

//MONGO STUFF
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://35.163.48.45/sandbox');
mongoose.Promise = global.Promise
async = require('async');
/****************END (Middle Ware Declarations)*********************/ 



//Instantiating express
var app = express();


/**********************************************************************
************************VIEW ENGINE CONFIGS****************************
***********************************************************************/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
/**********************END (VIEW ENGINE CONFIGS)************************/




/**********************************************************************
**********************Multer FILE UPLOAD CONFIGS***********************
***********************************************************************/
var multer = require('multer');
//var upload = multer({ dest: 'transfers/' });

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'transfers/')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })
/**********************END (Multer FILE UPLOAD CONFIGS)*****************/


/**********************************************************************
**************************MOGO FILE UPLOAD CONFIGS*********************
***********************************************************************/
var filePluginLib = require('mongoose-file');
var filePlugin = filePluginLib.filePlugin;
var make_upload_to_model = filePluginLib.make_upload_to_model;


var transfers_base = path.join(__dirname, "transfers");
var transfers = path.join(transfers_base, "u");

/**********************END (MOGO FILE UPLOAD CONFIGS)********************/






/**********************************************************************
**********************Logger And Body Parser Configs*******************
***********************************************************************/
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



/**********************************************************************
******************Session and cookie parser Configs********************
***********************************************************************/
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 180000 }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



/**********************************************************************
******************Flash and Express Messages Configs*******************
***********************************************************************/
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
/***********************END(of above)*********************************/








/**********************************************************************
*************************A MongoDB Schema******************************
***********************************************************************/
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

/***********************END(MongoDB Schema)*********************************/














/**********************************************************************
****************************INDEX ROUTE********************************
***********************************************************************/
// get requests
app.get('/', function( req, res ) {
	res.locals.isToolPage = false;
	var path = '/home/hooman/infoVisWeb/transfers';
 
	fs.readdir(path, function(err, items) {
		console.log(items);

		var uploadedFiles = [];
		for (var i=0; i<items.length; i++) {
			console.log(items[i]);
			uploadedFiles.push({"name":items[i]})
		}

		res.render('index', {"uploadedFiles": uploadedFiles});
	});
	
});


// post requests
app.post('/', upload.single('description_file'), function( req, res ) {

	console.log('uploaded file:\n');
	console.log(req.file);
	
	res.redirect('/');
});

/*************************END(INDEX ROUTE)*********************************/



/**********************************************************************
*****************************TOOL ROUTE********************************
***********************************************************************/
// get requests
app.get('/tool', function( req, res ) {
	res.locals.isToolPage = true;
	res.render('lunch');
});


// post requests
app.post('/tool', function( req, res ) {
	res.locals.isToolPage = true;

	var dataFile   = req.body.data_file_name;
	var outputFile   = req.body.output_file_name;
	var backPath = req.body.back_link;
	var actPath = req.body.act_link;

	console.log('hs dataFileName: '+dataFile);
	console.log('hs backPath: '+backPath);
	console.log('hs actPath: '+actPath);

	res.render('tool', {"dataFileName":dataFile, "backPath":backPath, "actPath":actPath, "outputFileName":outputFile});
});

/*************************END(TOOL ROUTE)*********************************/




/**********************************************************************
***************************TOOL DATA ROUTE*****************************
***********************************************************************/
app.get('/tool/data/:fileName', function(req, res){

  var filename = req.params.fileName;
  var file = 'transfers/'+filename;

  
  var stats;
  try {
	stats = fs.lstatSync(file); //Look for the file name if its not there, do cath. 

	var mimetype = mime.lookup(file);
	console.log('filename: ' + filename + '\nmimetype: '+ mimetype)
	res.setHeader('Content-disposition', 'inline; filename=' + filename);
	res.setHeader('Content-type', mimetype);

	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
  } catch(e) {
	//send a 404 error
	console.log('hs could not find the requested data file')
	res.writeHead(404, {'Content-type': 'text/plain'});
	res.write('404 not found');

	//end the connection to client
	res.end();

	//end server
	return;
  }

});
/***********************END(TOOL DATA ROUTE)*********************************/






/**********************************************************************
*************************Documentation ROUTE***************************
***********************************************************************/
// get requests
app.get('/documentation', function( req, res ) {
	res.locals.isToolPage = false;
	res.render('documentation');
});
/***********************END(Documentation ROUTE)***********************/






/**********************************************************************
****************************Contact ROUTE******************************
***********************************************************************/
// get requests
app.get('/contact', function( req, res ) {
	res.locals.isToolPage = false;
	res.render('contact');
});
/**************************END(Contact ROUTE)**************************/





//Export the app variable so that its available outside this file
module.exports = app;

