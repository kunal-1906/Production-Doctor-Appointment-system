const express=require('express')
const { loginController, registerController, authController,ApplyDoctorController,getAllNotificationController,deleteAllNotificationController, getAllDoctorsController, bookAppoinmentControlller, bookAppointmentController, bookingAvailabilityController, userAppointmentController } = require('../controllers/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');




const router=express.Router();
console.log("ApplyDoctorController:", ApplyDoctorController);
console.log("getAllNotificationController:", getAllNotificationController);


router.post('/login',loginController);

router.post('/register',registerController);

router.post('/getUserData',authMiddleware,authController);

router.post('/apply-doctor',authMiddleware,ApplyDoctorController);

router.post("/get-all-notification",authMiddleware,getAllNotificationController);

router.post("/delete-all-notification",authMiddleware,deleteAllNotificationController);


router.get('/getAllDoctors',authMiddleware,getAllDoctorsController)



router.post('/book-appointment',authMiddleware,bookAppointmentController)

router.post('/booking-availability',authMiddleware,bookingAvailabilityController);



router.get('/user-appointments',authMiddleware,userAppointmentController)

module.exports=router ;