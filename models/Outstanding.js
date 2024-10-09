const mongoose = require('mongoose');

const OutstandingSchema = new mongoose.Schema({
  bill_no: { type: String, required: true },
  amount: { type: Number, required: true },
  party: { type: String, required: true },
  user: { type: String, required: true },
});

module.exports = mongoose.model('Outstanding', OutstandingSchema);
