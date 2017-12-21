var express = require('express'),
	app = express(),
	port = 3001,
	mongoose = require('mongoose'),
	Memo = require('./api/models/memoModel'),
	bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/memo_db');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/html/'));


var routes = require('./api/routes/memoRoutes'); //importing route
routes(app); //register the route

app.use(function(req, res) {
	res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('memo RESTful API server started on: ' + port);
