const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Fill all the fields.",
      });
    }
    //create section
    const sectionDetails = await Section.create({ sectionName: sectionName });
    //update course with section ObjectID
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          courseContent: sectionDetails._id,
        },
      },
      { new: true }
    );

    const data = await Course.findById({ _id: courseId })
      .populate("courseContent")
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "section created successfully. ",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while creating section.",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, sectionId, courseId } = req.body;

    //validation
    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: "fill all details",
      });
    }
    //update
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        sectionName,
      },
      { new: true }
    );

    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection"
      },
    }).exec();

    return res.status(200).json({
      success: true,
      message: "section updated successfully. ",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating section.",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all data",
      });
    }

    // Update the Course to remove the sectionId from courseContent
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    );

    // Find the section details
    const sectionDetails = await Section.findById(sectionId);

    console.log("INSIDE SECTION ....", sectionDetails.subSection);

    // Delete the SubSection
    if (sectionDetails?.subSection.length > 0) {
      console.log("INSIDE SUBSECTION");
      await SubSection.deleteMany({
        _id: { $in: sectionDetails.subSection },
      });
    }

    // Delete the Section
    await Section.findByIdAndDelete(sectionId);

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section and SubSection deleted successfully.",
      data: course, // Optionally, you can send the updated course data in the response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting section.",
      error: error.message,
    });
  }
};
