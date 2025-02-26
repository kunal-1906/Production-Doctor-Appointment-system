const express =require ('express');
const authMiddleware =require("../middlewares/authMiddleware");
const { getAllUsersControllers, getAllDoctorsController, changeAccountStatusController } = require('../controllers/adminCtrl');
const router = express.Router();

router.get('/getAllUsers',authMiddleware,getAllUsersControllers);

router.get('/getAllDoctors',authMiddleware,getAllDoctorsController)

router.post('/changeAccountStatus',authMiddleware,changeAccountStatusController)


module.exports =router;
