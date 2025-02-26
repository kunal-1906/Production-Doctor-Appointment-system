const userModel = require("../models/userModels"); // ✅ Fix import path
const bcrypt = require("bcryptjs"); // ✅ Correct bcrypt import
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require('../models/appointmentModel');
const User = require("../models/userModels");  // Add this line
const moment = require('moment');
const registerController = async (req, res) => {
    try {
        // Check if the user already exists
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(200).send({ message: "User Already Exists", success: false });
        }

        // Validate password
        if (!req.body.password) {
            return res.status(400).send({ message: "Password is required", success: false });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // Create new user
        const newUser = new userModel(req.body);
        await newUser.save();

        res.status(201).json({ message: "Registered Successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Register Controller Error: ${error.message}` });
    }
};

const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Email or Password", success: false });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT Secret is missing! Set it in the environment variables.");
            return res.status(500).json({ message: "Internal Server Error", success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "Login Successful", success: true, token });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: `Error in Login Controller: ${error.message}`, success: false });
    }
};

const authController = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({ message: "User not found", success: false });
        }
        user.password = undefined;
        res.status(200).send({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Auth Error", success: false, error });
    }
};

const ApplyDoctorController = async (req, res) => {
    try {
        console.log("Received data:", req.body);

        // Ensure correct field names match the schema
        const formattedDoctorData = {
            firstname: req.body.firstname, 
            lastname: req.body.lastname,
            phoneNumber: req.body.phonenumber, // Keep as a string
            email: req.body.email,
            address: req.body.address,
            specialisation: req.body.specialisation, // Correct field name
            experience: req.body.experience,
            feesPerConsultation: parseFloat(req.body.feesperconsultation), // Convert to number
            timings: Array.isArray(req.body.timings) ? req.body.timings : [req.body.timings], // Ensure array format
            status: 'pending',
            userId: req.body.userId,
        };

        // Validation Check
        if (!formattedDoctorData.firstname || !formattedDoctorData.lastname || !formattedDoctorData.specialisation || !formattedDoctorData.timings.length) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields." 
            });
        }

        // Create new doctor application
        const newDoctor = new doctorModel(formattedDoctorData);
        await newDoctor.save();

        // Find admin user
        const adminUser = await userModel.findOne({ isAdmin: true });

        if (adminUser) {
            // Add notification for admin
            const notification = adminUser.notification || [];
            notification.push({
                type: 'apply-doctor-request',
                message: `${newDoctor.firstname} ${newDoctor.lastname} has applied for a doctor account.`,
                data: {
                    doctorId: newDoctor._id,
                    name: `${newDoctor.firstname} ${newDoctor.lastname}`,
                    onClick: '/admin/doctors',
                },
            });

            await userModel.findByIdAndUpdate(adminUser._id, { notification });
        }

        res.status(201).json({
            success: true,
            message: 'Doctor account application submitted successfully.',
        });

    } catch (error) {
        console.error("Error in ApplyDoctorController:", error);
        res.status(500).json({
            success: false,
            message: 'Error while applying as a doctor.',
            error: error.message,
        });
    }
};



const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId); // Fix: Find user by ID

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure 'seennotification' & 'notification' exist
        user.seennotification = user.seennotification || [];
        user.notification = user.notification || [];

        // Move notifications to seen
        user.seennotification.push(...user.notification);
        user.notification = []; // Clear unread notifications

        // Save the updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            data: user,
        });
    } catch (error) {
        console.error("Error in getAllNotificationController:", error);
        res.status(500).json({
            success: false,
            message: "Error while marking notifications as read",
            error: error.message,
        });
    }
};

const deleteAllNotificationController= async(req,res)=>
{

    try {
        const user =await userModel.findOne({_id:req.body.userId})
        user.notification=[]
        user.seennotification=[]
        const updatedUser = await user.save()
        updatedUser.password= undefined,
        res.status(200).send({
            success:true,
            message:"Notification Deleted Successfully",
            data:updatedUser,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Unable To Delete All Notifications',
            error
        })
        
    }
}



const getAllDoctorsController = async(req,res) =>{
    try {
        const doctors = await doctorModel.find({status:'approved'})
        res.status(200).send({
            success:true,
            message:'Doctors list fetched successfully',
            data:doctors
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error while fetching doctor'
        })
    }
}


const bookAppointmentController = async (req, res) => {
    try {
        req.body.date= moment(req.body.date,'DD-MM-YYY').toISOString();
        req.body.time = moment(req.body.time,'HH:mm').toISOString();
      req.body.status = "pending";
      const newAppointment = new appointmentModel(req.body);
      await newAppointment.save();
  
      const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
  
      user.notification.push({
        type: "New-appointment-request",
        message: `A New Appointment Request from ${req.body.userInfo.name}`,
        onClickPath: "/user/appointments",
      });
  
      await user.save();
  
      res.status(200).send({
        success: true,
        message: "Appointment Booked successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error While Booking Appointment",
      });
    }
  };
  
const bookingAvailabilityController = async(req,res) => {
    try {
        const date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
        const fromTime = moment(req.body.time,'HH:mm').subtract(1,'hours').toISOString();
        const toTime = moment(req.body.time,'HH:mm').add(1,'hours').toISOString();
  const doctorId = req.body.doctorId;
  const appointments = await appointmentModel.find({doctorId,date,
    time:{
            $gte:fromTime,$lte:toTime
    }
    
  })
  if(appointments.length > 0){
    return res.status(200).send({
        message:'Appointment Not Available At this time',
        success:true
    
    })
} else{
    return res.status(200).send({
        success:true,
        message:'Apppointments Available'
    })
}
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error In Booking'
        })
        
    }
}

const userAppointmentController = async(req,res) =>{
    try {
        const appointments = await appointmentModel.find({
            userId: req.body.userId,
        });
        res.status(200).send({
            success:true,
            message:'Users Appointments Fetch Successfully',
            data:appointments,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error In user Appointments'
        })
    }

}

module.exports = { loginController, 
    registerController,
     authController, 
     ApplyDoctorController,
     getAllNotificationController,
     deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController,
    bookingAvailabilityController,
    userAppointmentController
    
    };
