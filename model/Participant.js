const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    dynamicFields: mongoose.Schema.Types.Mixed,
});

const Participant = mongoose.model('Registration', registrationSchema);

module.exports = Participant;
