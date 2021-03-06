'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemoSchema = new Schema({
    _id: {
        type: String,
        unique: true,
    },
    msg: {
        type: String,
        required: 'Kindly enter content of your message'
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    expired_on: {
        type: Date
    },
    max_access_count: {
        type: Number,
        min: 0,
        default: 0
    },
    access_count: {
        type: Number,
        min: 0,
        default: 0
    }
});

module.exports = mongoose.model('memo', MemoSchema);