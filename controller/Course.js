const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const CourseProgress = require("../models/CourseProgress");

//create Course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      courseTitle,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      instructions,
    } = req.body;

    const thumbnail = req.files && req.files.thumbnailImage;

    console.log(
      "SERVER SIDE DATA....",
      courseTitle,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      instructions,
      thumbnail
    );

    // Validation
    if (
      !courseTitle ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !category ||
      !thumbnail ||
      !instructions
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Fill in all details." });
    }

    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });

    if (!instructorDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }

    const categoryValidation = await Category.findById(category);

    if (!categoryValidation) {
      return res
        .status(404)
        .json({ success: false, message: "Category is not valid." });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    if (!thumbnailImage || !thumbnailImage.secure_url) {
      // Handle the case where the thumbnail upload or secure_url retrieval fails
      return res.status(500).json({
        success: false,
        message: "Thumbnail upload failed.",
      });
    }

    const courseEntry = await Course.create({
      courseTitle,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tags: tag,
      category: categoryValidation._id,
      thumbnail: thumbnailImage.secure_url,
      instructions,
    });

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: courseEntry._id } },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: courseEntry._id } },
      { new: true }
    );
 
    

    return res
      .status(200)
      .json({ success: true, message: "Course created", data: courseEntry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
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
    const  {courseId}  = req.body;
    console.log("in BAckend", req.body);
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
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
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something is not right.",
      error: error.message,
    });
  }
};

//edit course
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not Found" });
    }

    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage && req.files;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    return res
      .status(200)
      .json({ success: true, message: "Course updated", data: updatedCourse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


//get a list of instructor courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await Course.find({instructor: instructorId}).sort({createdAt: -1})

   return res.status(200).json({
      success: true,
      data: instructorCourses,
    })

  } catch (error) {
    console.log("Error in instructor course api gateway", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

exports.deleteCourse = async(req, res) => {
  try {
    const { courseId } = req.body;
    const instructorId = req.user.id;

    const instructor = await User.findByIdAndUpdate(
      { _id: instructorId },
      { $pull: { courses: courseId } },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    } 
    
    const course = await Course.findById(courseId)

    if(!course) {
      return res.status(404).json({message: "Course Not Found"})
    }

    const studentsEnrolled = course.studentEnrolled

    if(studentsEnrolled.length > 0) {
      for(const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: {courses: courseId},
        })
      }
    }

    const courseSections = course.courseContent
    
    if(courseSections.length > 0) {
      for(const sectionId of courseSections) {
        const section = await Section.findById(sectionId)
        if(section) {
          const subSections = section?.subSection
          if(subSections.length > 0) {
            for(const subSectionId of subSections) {
              await SubSection.findByIdAndDelete(subSectionId)
            }
          }
        }
        await Section.findByIdAndDelete(sectionId)
      }
    }



    // Delete the Course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course, Sections, and SubSections deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting course.",
      error: error.message,
    });
  }
}

// Function to convert seconds to HH:MM:SS format
const convertSecondsToDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return formattedDuration;
};

exports.getFullDetailsOfCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    console.log("in Backend", req.body);

    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();


      let courseProgressCount = await CourseProgress.findOne({
        courseId: courseId,
        userId: userId,
      });


    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      message: "Here are your course details.",
      data: {courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something is not right.",
      error: error.message,
    });
  }
};
