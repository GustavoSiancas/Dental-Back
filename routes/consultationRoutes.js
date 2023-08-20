const express = require("express");
const router = express.Router();
const ConsultationController = require("../controllers/consultationController");

const check = require("../authorization/auth");

router.post("/", check.auth, ConsultationController.create);
router.get("/list", ConsultationController.list);
router.get("/", ConsultationController.consultationById);
router.get("/myConsultationsByPatient", check.auth, ConsultationController.myConsultationByPatient);
router.get("/myConsultationsByDoctor", check.auth, ConsultationController.myConsultationByDoctor);
router.get("/myConsultationsByCampus", check.auth, ConsultationController.myConsultationByCampus);

module.exports = router;