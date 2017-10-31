'use strict';
module.exports = function(app) {
	var memoReqs = require('../controllers/memoController');

	// memo Routes
	app.route('/memo')
	.post(memoReqs.create_a_memo);


	app.route('/memo/:memoId')
	.get(memoReqs.read_a_memo)
};