const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//updateProfile
exports.updateProfile = async (req, res) => {
  try {
    // Get data
    const { gender, dateOfBirth = "", contactNumber, about = "" } = req.body;
    const userId = req.user.id;

    // Validation
    if (!userId || !gender || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Fill all details.",
      });
    }

    // Update profile
    const userDetails = await User.findById(userId);
    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    // Save the updated profile details
    await profileDetails.save();

    // Fetch the updated user details after saving
    const updatedUserDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    // You can modify the response to include the updated user data
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUserDetails, // Include the updated user data in the response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while updating profile.",
    });
  }
};

//delete Account
exports.deleteAccount = async (req, res) => {
  try {
    // Fetch id
    const id = req.user.id;

    // Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Provide user id.",
      });
    }

    // Fetch user details
    const userDetails = await User.findById(id);

    // Delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // Pull the id from studentEnrolled in courses
    if (userDetails.courses && userDetails.courses.length > 0) {
      for (const courseId of userDetails.courses) {
        await Course.findByIdAndUpdate(
          { _id: courseId },
          {
            $pull: {
              studentEnrolled: id,
            },
          },
          { new: true }
        );
      }
    }

    // Delete user
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Account deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllUserDetails
exports.getAllUserDetails = async (req, res) => {
  try {
    const { email } = req.user || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email nahi mil rahi hai bhai.",
      });
    }

    // Fetch user details based on email
    console.log("BEFORE FIND USER");
    const user = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();
    console.log("AFTER FIND USER...", user);
    console.log("USER KI ADDITIONAL DETAILS...", user.additionalDetails);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User nahi mila bhai.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All users data.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const { email } = req.user || {};

    const file = req.files && req.files.displayPicture;

    console.log("IN SERVER FILE", file);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file not found",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email not found",
      });
    }
    const imageUrl = await uploadImageToCloudinary(
      file,
      process.env.FOLDER_NAME
    );

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Perform the update
    await User.updateOne({ email }, { image: imageUrl.secure_url });

    const updatedUser = await User.findOne({ email });

    return res.status(200).json({
      success: true,
      message: "dp updated",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//getEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({ _id: userId })
      .populate("courses")
      .exec();

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "enrolled all courses",
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.instructorDashboard = async(req, res) => {
  try {
    
    const courseDetails = await Course.find({instructor: req.user.id});

    if(!courseDetails) {
      return res.status(404).json({
        success: false,
        message:"Course not found"
      })
    }

    const courseData = courseDetails.map((course) => {
      const totalStudentEnrolled = course.studentEnrolled.length
      const totalAmountGenerated = totalStudentEnrolled * course.price


      // Create an new object with the additional field 
      const courseDataWithStats = {
        _id: course._id,
        courseTitle: course.courseTitle,
        courseDescription: course.courseDescription,
        totalStudentEnrolled,
        totalAmountGenerated
      }
      return courseDataWithStats;
    })

    res.status(200).json({
      success: true,
      message: "here is your needed data",
      courses: courseData
    });


  } catch (error) {
    console.log("Error: ",error.message)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}