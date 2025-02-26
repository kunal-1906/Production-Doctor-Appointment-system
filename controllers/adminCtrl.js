const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');

const getAllUsersControllers = async (req, res) => {
    try {
        const users = await userModel.find({});  // ✅ Corrected variable name
        res.status(200).send({
            success: true,
            message: 'Users Data List',
            data: users,  // ✅ Using the correct variable
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error While Fetching Users',
            error
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        res.status(200).send({
            success: true,
            message: 'Doctors Data List',
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error While Fetching Doctors Data',
            error
        });
    }
};


const changeAccountStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;

        if (!doctorId || !status) {
            return res.status(400).send({
                success: false,
                message: "Doctor ID and status are required.",
            });
        }

        // ✅ Ensure the doctor exists
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found",
            });
        }

        // ✅ Update doctor status
        doctor.status = status;
        await doctor.save();

        // ✅ Find the associated user
        const user = await userModel.findById(doctor.userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Associated user not found",
            });
        }

        // ✅ Add notification
        user.notification.push({
            type: "doctor-account-request-updated",
            message: `Your Request For Doctor Account Has Been ${status}`,
            onClickPath: "/notification",
        });

        // ✅ Update isDoctor status
        user.isDoctor = status === "approved";

        await user.save(); // Save updated user

        res.status(200).send({
            success: true,
            message: "Account Status Updated Successfully",
            data: { user, doctor },
        });
    } catch (error) {
        console.error("Error in Account Status Update:", error);
        res.status(500).send({
            success: false,
            message: "Error updating account status",
            error,
        });
    }
};





module.exports = { getAllDoctorsController, getAllUsersControllers,changeAccountStatusController};
