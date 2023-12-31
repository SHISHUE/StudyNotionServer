const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create Course
exports.createCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      courseDescription,
      whatYouWillLearn,
      price,
      // tag,
      category,
      instructions
    } = req.body;

    // const thumbnail = req.files.thumbnailImage;

    // Validation
    if (!courseTitle ||
       !courseDescription ||
        !whatYouWillLearn ||
         !price ||
          // !tag ||
           !category ||
            // !thumbnail ||
             !instructions) {
      return res.status(400).json({ success: false, message: "Fill in all details." });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);

    if (!instructorDetails) {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }

    const categoryValidation = await Category.findById(category);

    if (!categoryValidation) {
      return res.status(404).json({ success: false, message: "Category is not valid." });
    }

    // const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    const courseEntry = await Course.create({
      courseTitle,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      // tags: tag,
      category: categoryValidation._id,
      // thumbnail: thumbnailImage.secure_url,
      instructions
    });

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: courseEntry._id } },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { course: courseEntry._id } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Course created", data: courseEntry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


//get All Courses
exports.showAllCourses = async (req, res) => {
  try {
    const courseId = req.body;
    const allCourses = await Course.find(
      { _id: courseId },
      {
        courseTitle: true,
        courseDescription: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentEnrolled: true,
      }
    )
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetalis",
        },
      })
      .populate("category")
      .populate("ratingAndreviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Courses",
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get intial data
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      // .populate("ratingAndreviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `could not find the course with ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Here your course all details.",
      data: courseDetails,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something is not right.",
      error:error.message
    });
  }
};
