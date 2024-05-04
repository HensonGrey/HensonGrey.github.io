
const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    submitTime: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Report = mongoose.model(`Report`, reportSchema);

module.exports = Report;