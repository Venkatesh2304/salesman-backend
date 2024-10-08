
const mongoose = require('mongoose');

const CollSchema = new mongoose.Schema({
  party: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['cheque', 'neft'], required: true },
  bills: [
    {
      bill_no : { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  user: { type: String, required: true },
  time: { type: Date, default: Date.now }, // New field for storing the insertion time
});

module.exports = mongoose.model('Coll', CollSchema);
