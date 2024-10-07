const mongoose = require('mongoose');

const CollSchema = new mongoose.Schema({
    bill_no: { type: String, required: true },
    amt: { type: Number, required: true },
    type: { type: String, enum: ['cheque', 'neft'], required: true },
    user : { type: String, required: true },
    time : { type: Date, default: Date.now }, // Add this line
});

module.exports = mongoose.model('Coll', CollSchema);
