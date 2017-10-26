'use strict';

const SUCCESS_CODE = 200;
const FAILURE_CODE = 400;

var mongoose = require('mongoose'),
Memo = mongoose.model('memo');

exports.create_a_memo = function(req, res) {
	var msg = req.body.msg;
	var expired = req.body.expired_on;
	var regex = /^([1-9][0-9]*)((min)|(hr)|(day))$/;

	if (expired != null && expired != "" && expired != undefined) {
		if (!regex.test(expired)) {
			res.send({
				result: FAILURE_CODE,
				msg: "Invalid expiring time!"
			});
		} else {
			var num = expired.match(regex)[1];
			var unit = expired.match(regex)[2];
			var diff;
			if (unit == "min") {
				diff = num * 60 * 1000;
			} else if (unit == "hr") {
				diff = num * 60 * 60 * 1000;
			} else if (unit == "day") {
				diff = num * 24 * 60 * 60 * 1000;
			}
			var new_memo = new Memo({
				msg: msg,
				expired_on: new Date(new Date().getTime() + diff)
			});
			new_memo.save(function(err, memo) {
				if (err)
					res.send(err);
				res.json({
					result: SUCCESS_CODE,
					memoId: memo._id,
					expired_on: expired_on
				});
			});
		}
	} else {
		var new_memo = new Memo({msg:msg});
		new_memo.save(function(err, memo) {
			if (err)
				res.send(err);
			res.json({
				result: SUCCESS_CODE,
				memoId: memo._id
			});
		});
	}

	
};

exports.read_a_memo = function(req, res) {
	Memo.findOne({'_id' : req.params.memoId}, function(err, memo) {
		if (err)
			res.send(err);
		if (memo == null) {
			res.json({
					result: FAILURE_CODE,
					msg: "The memo you query doesn't exist."
				});
		} else if (memo.expired_on == null || undefined || "") {
			// this memo doesn't has a expire date, it is ever-lasting
			memo.access_count++;
			memo.save();
			res.json({
				result: SUCCESS_CODE,
				msg: "Succeed",
				memo: memo
			});
		} else {
			if ((memo.expired_on - new Date()) < 0) {
				res.json({
					result: FAILURE_CODE,
					msg: "The memo you are accessing has expired."
				});
			} else {
				memo.access_count++;
				memo.save();
				res.json({
					result: SUCCESS_CODE,
					msg: "Succeed",
					memo: memo
				});
			}
		}

		
	});
};