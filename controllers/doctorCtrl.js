const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");

const moment = require("moment"); // ✅ Required for formatting timings

const getDoctorInfoController = async (req, res) => {
    try {
        console.log("Received userId:", req.query.userId); // ✅ Debugging log

        const doctor = await doctorModel.findOne({ userId: req.query.userId });

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Doctor Data fetched successfully",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In Fetching Doctor Details",
        });
    }
};



const updateProfileController = async (req, res) => {
    try {
        console.log("Received update request:", JSON.stringify(req.body, null, 2)); // Debugging log
        
        const { userId, timings, firstName, lastName, phone, specialisation } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Fetch existing doctor data
        const existingDoctor = await doctorModel.findOne({ userId });
        if (!existingDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Check if required fields are missing from req.body
        if (!firstName || !lastName || !phone || !specialisation) {
            console.warn("⚠️ Missing fields in request:", { firstName, lastName, phone, specialisation });
        }

        // Validate and format timings if provided
        let formattedTimings = existingDoctor.timings;
        if (timings) {
            if (!Array.isArray(timings) || timings.length !== 2) {
                return res.status(400).json({ success: false, message: "Invalid timings format" });
            }
            formattedTimings = timings.map(time =>
                moment(time, ["HH:mm", "h:mm A"]).format("HH:mm")
            );
        }

        // Update only fields that are provided; otherwise, keep existing values
        const updateFields = {
            firstName: firstName || existingDoctor.firstName,
            lastName: lastName || existingDoctor.lastName,
            phone: phone || existingDoctor.phone,
            specialisation: specialisation || existingDoctor.specialisation,
            timings: formattedTimings
        };

        console.log("🔄 Updating with fields:", updateFields); // Log update fields

        // Perform the update
        const updatedDoctor = await doctorModel.findOneAndUpdate(
            { userId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedDoctor });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const getDoctorByIdController =async(req,res)=>{
    try {
        const doctor =await doctorModel.findOne({_id:req.body.doctorId});
        res.status(200).send({
            success:true,
            message:'Single doctor info fetched',
            data:doctor
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in single doctor info'
        })
    }

};

const doctorAppointmentController = async(req,res) => {

    try {
                 // ✅ Prevent caching of API response
                 res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                 res.setHeader("Pragma", "no-cache");
                 res.setHeader("Expires", "0");

        const doctor = await doctorModel.findOne({userId:req.body.userId})
        const appointments = await appointmentModel.find({
            doctorId: doctor._id,

        });



        res.status(200).send({
            success:true,
            message:'doctor appointment fetched successfully',
            data:appointments,
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error In Doc appointments'
        })
    }

}

const updateAppointmentStatusController = async (req, res) => {
    try {
      console.log("Received Request Body:", req.body);
  
      const { appointmentId, status } = req.body;
      if (!appointmentId || !status) {
        return res.status(400).json({ success: false, message: "Invalid Data" });
      }
  
      const updatedAppointment = await appointmentModel.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true }
      );
  
      if (!updatedAppointment) {
        return res.status(404).json({ success: false, message: "Appointment Not Found" });
      }
  
      console.log("Updated Appointment:", updatedAppointment);
  
      // Find user and push notification
      const user = await userModel.findOne({ _id: updatedAppointment.userId });
      if (user) {
        user.notification.push({
          type: "status-updated",
          message: `Your appointment status is now ${status}`,
          onClickPath: "/doctor-appointments",
        });
        await user.save();
      }
  
      res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        data: updatedAppointment,
      });
  
    } catch (error) {
      console.error("Error in updateAppointmentStatusController:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  
  

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentController,
    updateAppointmentStatusController
};