const { Schema, model } = require("mongoose");

const TreatmentAppointmentSchema = Schema({
    treatmentDetail: {
        type: Schema.ObjectId,
        ref: "TreatmentDetail"
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    hourScheduled: {
        type: String,
        required: true
    },
    hourAssisted: {
        type: String,
        required: true
    },
    doctor: {
        type: Schema.ObjectId,
        ref: "Doctor"
    },
    campus: {
        type: Schema.ObjectId,
        ref: "Campus"
    }
});

module.exports = model("TreatmentAppointment", TreatmentAppointmentSchema, "treatmentAppointments");