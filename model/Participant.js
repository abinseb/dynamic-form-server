const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    dynamicFields: mongoose.Schema.Types.Mixed,
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
