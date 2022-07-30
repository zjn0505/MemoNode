'use strict';

const SUCCESS_CODE = 200;
const FAILURE_CODE = 400;

var mongoose = require('mongoose'),
Memo = mongoose.model('memo');
var nanoid = require('nanoid/generate');


function genUid(callback) {
	var uid = nanoid("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
	console.log("Uid gen " + uid)
	Memo.findOne({'_id' : uid}, function(err, memo) {
		if (err == null && memo == null) {
			console.log("Fresh uid")
			callback(uid);
			return;
		}
		console.log("Duplicated Uid")
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
	if (!msg) {
		return;
	}
	var expired = req.body.expired_on;
	var client = req.body.client;
	var contact = req.body.contact
	if (contact == 1) {
		console.log("spam on create " + client, req.headers['x-forwarded-for'] || req.socket.remoteAddress)
		res.send("OK");
		return;
	}
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
				console.log("Apply uid for new memo " + uid)
				var new_memo = new Memo({
					msg: msg,
					_id: uid,
					expired_on: expired_on,
					max_access_count: expired_after_count
				});
				new_memo.save(function(err, _memo) {
					if (err)
						res.send(err);
					if (client != null && client == 'web') {
						res.send("<p>"+_memo._id+"</p>")
					} else {
						res.json({
							result: SUCCESS_CODE,
							msg : "Succeed",
							memo: new memo(_memo)
						});
					}
					return
				});

			}); 
};

exports.read_a_memo = function(req, res) {
	var client = req.query.client;
	var id = req.query.memoId
	if (req.params.memoId != null) {
		id = req.params.memoId
		client = 'web'
	}
	var contact = req.body.contact
	if (contact == 1) {
		console.log("spam on read " + client, req.headers['x-forwarded-for'] || req.socket.remoteAddress)
		res.send("OK");
		return;
	}
	var redirect = false
	if (id != null && id != undefined && id.endsWith('-')) {
		id = id.substring(0, id.length-1)
		redirect = true
	}
        if (id == null || id == undefined) {
		res.sendFile('web_portal.html', { root: './public/memo' })
		return
	}	

	
	Memo.findOne({'_id' : id}, function(err, _memo) {
		if (err)
			res.send(err);
		if (_memo == null) {
			handleError(res, client, "The memo you query doesn't exist.")
			return;
		}

		var valid_date = true, valid_count = true;
		if (_memo.expired_on != null && (_memo.expired_on - new Date()) < 0) {
			valid_date = false;
		}

		if (_memo.max_access_count != null && _memo.max_access_count != 0 && _memo.max_access_count <= _memo.access_count) {
			valid_count = false;
		}

		if (!valid_date) {
			handleError(res, client, "The memo you are accessing has expired.")
			return;
		} else if (!valid_count) {
			handleError(res, client, "The memo you are accessing has reached maximum access count.")
			return;
		} else {
			_memo.access_count++;
			_memo.save();
			if (client != null && client == "web") {
				if (redirect) {
					res.redirect(_memo.msg)
				} else {
					res.send(_memo.msg)
				}
			} else {
				res.json({
					result: SUCCESS_CODE,
					msg: "Succeed",
					memo: new memo(_memo)
				});
			}
			return;
		}
	});
};

function handleError(res, client, msg) {
	if (client != null && client == "web") {
		res.send(msg)
	} else {
		res.json({
			result: FAILURE_CODE,
			msg: msg
		});
	}
}
