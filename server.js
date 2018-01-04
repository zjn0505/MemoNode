var express = require('express'),
	app = express(),
	port = 3001,
	mongoose = require('mongoose'),
	Memo = require('./api/models/memoModel'),
	bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/memo_db');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url.indexOf("/icon/") === 5 || req.url.indexOf("/css/") === 5 || req.url.indexOf("/script/") === 5) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  if (req.url.indexOf("/script/main.js") === 5) {
  	res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Expires", new Date(Date.now() + 360000).toUTCString());
  }
  next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));


var routes = require('./api/routes/memoRoutes'); //importing route
routes(app); //register the route

app.use(function(req, res) {
	res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('memo RESTful API server started on: ' + port);
