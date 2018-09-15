'use strict';
module.exports = function(app) {
	var memoReqs = require('../controllers/memoController');

	// memo Routes	
	app.route('^/memo/:memoId([0-9A-Za-z]{4,5}-?$)')
	.get(memoReqs.read_a_memo)

	app.route('/memo')
	.post(memoReqs.create_a_memo)
	.get(memoReqs.read_a_memo)
};
