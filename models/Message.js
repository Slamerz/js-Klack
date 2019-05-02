const {Schema, Types, model} = require('mongoose');

const messageSchema = new Schema({
    _id: Types.ObjectId,
    author: String,
    body: String,
    date: Date
});

module.exports = model('Message', messageSchema);