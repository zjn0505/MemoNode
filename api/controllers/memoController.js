'use strict';

const SUCCESS_CODE = 200;
const FAILURE_CODE = 400;

var mongoose = require('mongoose'),
Memo = mongoose.model('memo');
var nanoid = require('nanoid/generate');


function genUid(callback) {
	var uid = nanoid("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
	Memo.findOne({'_id' : uid}, function(err, memo) {
		if (err == null && memo == null) {
			callback(uid);
			return;
		}
		genUid(callback)
	});	
}

function memo(_memo) {
	this._id = _memo._id;
	this.msg = _memo.msg;
	this.access_count = _memo.access_count;
	this.created_date = _memo.created_date;
	this.expired_on = _memo.expired_on;
	this.max_access_count = _memo.max_access_count;
}

exports.create_a_memo = function(req, res) {
	var msg = req.body.msg;
	var expired = req.body.expired_on;
	var max_access = req.body.max_access_count;
	var regex = /^([1-9][0-9]*)((min)|(hr)|(day))$/;
	var expired_on = null;
	var expired_after_count = null;
	if (expired != null && expired != "" && expired != undefined) {
		if (!regex.test(expired)) {
			res.send({
				result: FAILURE_CODE,
				msg: "Invalid expiring time!"
			});
			return;
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
			expired_on = new Date(new Date().getTime() + diff);
		}
	}

	if (max_access != null && max_access != "" && max_access != undefined) {
		 if (Number(max_access) < 0 || !Number.isInteger(Number(max_access))) {
			res.send({
				result: FAILURE_CODE,
				msg: "Invalid max access count!"
			});
			return
		} else {
			expired_after_count = Number(max_access);
		}
	}

	genUid(function(uid) {

				var new_memo = new Memo({
					msg: msg,
					_id: uid,
					expired_on: expired_on,
					max_access_count: expired_after_count
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
		}

		var valid_date = true, valid_count = true;
		if (_memo.expired_on != null && (_memo.expired_on - new Date()) < 0) {
			valid_date = false;
		}

		if (_memo.max_access_count != null && _memo.max_access_count != 0 && _memo.max_access_count <= _memo.access_count) {
			valid_count = false;
		}

		if (!valid_date) {
			res.json({
					result: FAILURE_CODE,
					msg: "The memo you are accessing has expired."
				});
		} else if (!valid_count) {
			res.json({
					result: FAILURE_CODE,
					msg: "The memo you are accessing has reached maximum access count."
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
	});
};


