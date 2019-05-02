const {Schema, ObjectId, model} = require('mongoose');

const messageSchema = new Schema({
    _id: {type: ObjectId, default: new ObjectId},
    author: String,
    body: String,
    date: {type: Date, default: Date.now()}
});

module.exports = model('Message', messageSchema);