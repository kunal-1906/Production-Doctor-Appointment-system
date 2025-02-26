const express = require("express");
const { getDoctorInfoController, 
    updateProfileController, 
    getDoctorByIdController,
    doctorAppointmentController,
    updateAppointmentStatusController
 } = require("../controllers/doctorCtrl"); 
const authMiddleware = require("../middlewares/authMiddleware"); // Import auth middleware

const router = express.Router();

router.get("/getDoctorInfo", authMiddleware, getDoctorInfoController);
router.post("/updateProfile", authMiddleware, updateProfileController);

router.post('/getDoctorById',authMiddleware,getDoctorByIdController);


router.get('/doctor-appointments',authMiddleware,doctorAppointmentController);

router.post("/update-appointment-status",authMiddleware ,updateAppointmentStatusController);

module.exports = router;
