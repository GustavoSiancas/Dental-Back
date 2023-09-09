const Consultation = require("../models/consultationModel");
const Campus = require("../models/campusModel");

const create = async (req, res) => {
    let body = req.body;
    let userId = req.user.id;
    let patientId = req.query.idPatient;
    let doctorId = req.query.idDoctor;
    let campusId;

    try {
        const campus = await Campus.findOne({ user: userId });
      
        if (!campus) {
          return res.status(404).json({
            status: "Error",
            message: "No campus available..."
          });
        }
      
        campusId = campus._id;
      
    } catch (error) {
        return res.status(500).json({
          status: "error",
          error
        });
    }

    if (!body.consultationReason || !body.cost || !body.status || !body.hourScheduled || !body.hourAssisted) {
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    }

    let bodyConsultation = {
        patient: patientId,
        doctor: doctorId,
        campus: campusId,
        consultationReason: body.consultationReason,
        cost: body.cost,
        date: body.date,
        status: body.status,
        hourScheduled: body.hourScheduled,
        hourAssisted: body.hourAssisted
    }

    let consultation_to_save = new Consultation(bodyConsultation);

    try {
        const consultationStored = await consultation_to_save.save();

        if (!consultationStored) {
            return res.status(500).json({
                "status": "error",
                "message": "No consultation saved"
            });
        }

        return res.status(200).json({
            "status": "success",
            "message": "Consultation registered",
            "consultation": consultationStored
        });
    } catch (error) {
        return res.status(500).json({
            "status": "error",
            "message": "Error while saving consultation",
            error
        });
    }
}

const list = (req, res) => {
    Consultation.find().populate("patient doctor campus").sort('_id').then(consultations => {
        if (!consultations) {
            return res.status(404).json({
                status: "Error",
                message: "No consultations avaliable..."
            });
        }

        return res.status(200).json({
            "status": "success",
            consultations
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const consultationById = (req, res) => {
    Consultation.findById(req.query.idConsultation).then(consultation => {
        if (!consultation) {
            return res.status(404).json({
                "status": "error",
                "message": "Consultation doesn't exist"
            });
        }

        return res.status(200).json({
            "status": "success",
            "consultation": consultation
        });
    }).catch(() => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while finding consultation"
        });
    });
}

const myConsultationByPatient = (req, res) => {
    let userEmail = req.user.email;

    Consultation.find().populate(["campus", { path: "doctor", populate: { path: "personData" } }, { path: "patient", populate: [{ path: "user", match: { email: { $regex: userEmail, $options: 'i' } } }, { path: "personData" }] }]).then(consultation => {
        if (!consultation) {
            return res.status(404).json({
                status: "Error",
                message: "No consultation avaliable..."
            });
        }

        consultation = consultation.filter(consultation => consultation.patient.user);

        return res.status(200).json({
            "status": "success",
            consultation
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const myConsultationByDoctor = (req, res) => {
    let userEmail = req.user.email;

    Consultation.find().populate(["campus", { path: "patient", populate: { path: "personData" } }, { path: "doctor", populate: [{ path: "user", match: { email: { $regex: userEmail, $options: 'i' } } }, { path: "personData" }] }]).then(consultation => {
        if (!consultation) {
            return res.status(404).json({
                status: "Error",
                message: "No consultation avaliable..."
            });
        }

        consultation = consultation.filter(consultation => consultation.doctor.user);

        return res.status(200).json({
            "status": "success",
            consultation
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const myConsultationByCampus = async (req, res) => {
    let userEmail = req.user.email;

    Consultation.find({ status: "Scheduled" }).populate([{ path: "patient", populate: { path: "personData" } }, { path: "doctor", populate: { path: "personData" } }, { path: "campus", populate: { path: "user", match: { email: { $regex: userEmail, $options: 'i' } } } }]).sort('hourScheduled').then(consultations => {
        if (!consultations) {
            return res.status(404).json({
                status: "Error",
                message: "No consultation avaliable..."
            });
        }

        consultations = consultations.filter(consultation => consultation.campus.user);

        return res.status(200).json({
            "status": "success",
            consultations
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const editConsultation = (req, res) => {
    let id = req.query.idConsultation;

    Consultation.findOneAndUpdate({ _id: id }, req.body, { new: true }).then(consultationUpdated => {
        if (!consultationUpdated) {
            return res.status(404).json({
                status: "error",
                mensaje: "Consultation not found"
            });
        }
        return res.status(200).send({
            status: "success",
            consultation: consultationUpdated
        });
    }).catch(() => {
        return res.status(404).json({
            status: "error",
            mensaje: "Error while finding and updating consultation"
        });
    });
}

module.exports = {
    create,
    list,
    consultationById,
    myConsultationByPatient,
    myConsultationByDoctor,
    myConsultationByCampus,
    editConsultation
}