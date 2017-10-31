'use strict';

const SUCCESS_CODE = 200;
const FAILURE_CODE = 400;

var mongoose = require('mongoose'),
Memo = mongoose.model('memo');
var nanoid = require('nanoid/generate');


function genUid(callback) {
	console.log("gen uid start");
	var uid = nanoid("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
	console.log("gen uid " + uid);
	Memo.findOne({'_id' : uid}, function(err, memo) {
		if (err == null && memo == null) {
			console.log("found uid " + uid);
			callback(uid);
			return;
		}
		console.log("sadly");
		genUid(callback)
	});	
}

function memo(_memo) {
	this._id = _memo._id;
	this.msg = _memo.msg;
	this.access_count = _memo.access_count;
	this.created_date = _memo.created_date;
	this.expired_on = _memo.expired_on;
}

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
			var expired_on = new Date(new Date().getTime() + diff);

			genUid(function(uid) {

				var new_memo = new Memo({
					msg: msg,
					_id: uid,
					expired_on: expired_on
				});
				console.log("gen uid finished");
				new_memo.save(function(err, _memo) {
					if (err)
						res.send(err);
					res.json({
						result: SUCCESS_CODE,
						msg : "Succeed",
						memo: new memo(_memo)
					});
				});

			}); 
		}
	} else {
		genUid(function(uid) {

			var new_memo = new Memo({
				msg: msg,
				_id: uid
			});
			new_memo.save(function(err, _memo) {
				if (err)
					res.send(err);
				res.json({
					result: SUCCESS_CODE,
					msg : "Succeed",
					memo: new memo(_memo)
				});
			});

		}); 
		
	}
};

exports.read_a_memo = function(req, res) {
	Memo.findOne({'_id' : req.params.memoId}, function(err, _memo) {
		if (err)
			res.send(err);
		if (_memo == null) {
			res.json({
				result: FAILURE_CODE,
				msg: "The memo you query doesn't exist."
			});
		} else if (_memo.expired_on == null || undefined || "") {
			// this memo doesn't has a expire date, it is ever-lasting
			_memo.access_count++;
			_memo.save();
			res.json({
				result: SUCCESS_CODE,
				msg: "Succeed",
				memo: new memo(_memo)
			});
		} else {
			if ((_memo.expired_on - new Date()) < 0) {
				res.json({
					result: FAILURE_CODE,
					msg: "The memo you are accessing has expired."
				});
			} else {
				_memo.access_count++;
				_memo.save();
				res.json({
					result: SUCCESS_CODE,
					msg: "Succeed",
					memo: new memo(_memo)
				});
			}
		}
		
	});
};


