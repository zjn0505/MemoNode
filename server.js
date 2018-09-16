var config = require('config');
var express = require('express'),
    app = express(),
    port = config.port,
    mongoose = require('mongoose'),
    Memo = require('./api/models/memoModel'),
    bodyParser = require('body-parser'),
    swStats = require('swagger-stats');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(config.db);
if (config.has("swagger-stats")) {
    var swaggerConfig = config.get("swagger-stats");
    app.use(swStats.getMiddleware({
        name: swaggerConfig.name,
        uriPath: swaggerConfig.urlPath,
        onResponseFinish: function (req, res, rrr) {
            debug('onResponseFinish: %s', JSON.stringify(rrr));
        },
        authentication: true,
        sessionMaxAge: 900,
        elasticsearchIndexPrefix: swaggerConfig.elasticsearchIndexPrefix,
        elasticsearch: swaggerConfig.elasticsearch,
        onAuthenticate: function (req, username, password) {
            return ((username === swaggerConfig.username) && (password === swaggerConfig.password));
        }
    }));
}

app.use(function (req, res, next) {
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

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));


var routes = require('./api/routes/memoRoutes'); //importing route
routes(app); //register the route

app.use(function (req, res) {
    res.status(404).send({
        url: req.originalUrl + ' not found'
    })
});

app.listen(port);

console.log('memo RESTful API server started on: ' + port);