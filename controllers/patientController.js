const Patient = require("../models/patientModel");

const create = async (req, res) => {
    let userId = req.user.id;
    let personDataId = req.query.idPersonData;

    let bodyPatient = {
        personData: personDataId,
        user: userId
    }

    let patient_to_save = new Patient(bodyPatient);

    try {
        const patientStored = await patient_to_save.save();

        if (!patientStored) {
            return res.status(500).json({
                "status": "error",
                "message": "No patient saved"
            });
        }

        return res.status(200).json({
            "status": "success",
            "message": "Doctor registered",
            "patient": patientStored
        });
    } catch (error) {
        return res.status(500).json({
            "status": "error",
            "message": "Error while saving patient",
            error
        });
    }
}

const myPatient = (req, res) => {
    let userId = req.user.id;

    Patient.find({ user: userId }).populate("personData").then(patient => {
        if (!patient) {
            return res.status(404).json({
                status: "Error",
                message: "No patient avaliable..."
            });
        }

        return res.status(200).json({
            "status": "success",
            patient
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const list = (req, res) => {
    Patient.find().populate("personData").sort('_id').then(patients => {
        if (!patients) {
            return res.status(404).json({
                status: "Error",
                message: "No patients avaliable..."
            });
        }

        return res.status(200).json({
            "status": "success",
            patients
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const patientById = (req, res) => {
    Patient.findById(req.query.idPatient).then(patient => {
        if (!patient) {
            return res.status(404).json({
                "status": "error",
                "message": "Patient doesn't exist"
            });
        }

        return res.status(200).json({
            "status": "success",
            "patient": patient
        });
    }).catch(() => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while finding patient"
        });
    });
}

module.exports = {
    create,
    myPatient,
    list,
    patientById
}