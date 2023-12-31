const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { videoUploadToCloudinary } = require("../utils/videoUploader");
//create Sub-Section
exports.createSubSection = async (req, res) => {
  try {
    //data fetch
    const { title, description, timeDuration, sectionId } = req.body;
    const video = req.files.videoFile;

    //validation
    if (!title || !description || !timeDuration || !video || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Fill all details",
      });
    }
    //video upload to cloundinary
    const videoUrl = await videoUploadToCloudinary(
      video,
      process.env.FOLDER_NAME,
    );

    //create Sub-Section
    const newSubSection = await SubSection.create({
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: videoUrl.secure_url,
    });

    //Sub section update in section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: newSubSection._id,
        },
      },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: "Subsection created successfully. ",
      updatedSection,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Error while creating Subsection.",
      error:error.message
    });
  }
};

//update Sub-Section
exports.updateSubSection = async (req, res) => {
  try {
    //data fetch
    const { title, description, timeDuration, subSectionId } = req.body;
    const video = req.files.videoFile;

    //validation
    if (!title || !description || !timeDuration || !video || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Fill all details",
      });
    }
    //video upload to cloundinary
    const videoUrl = await videoUploadToCloudinary(
      video,
      process.env.FOLDER_NAME,
      {
        quality: "auto",
      }
    );

    //create Sub-Section
    const newSubSection = await SubSection.findByIdAndUpdate(subSectionId, {
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: videoUrl.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully. ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating Subsection.",
    });
  }
};

// delete Sub-Section
exports.deleteSubSection = async (req, res) => {
  try {
    // data fetch
    const { subSectionId, sectionId } = req.body;

    // validation
    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Fill all details",
      });
    }

    // delete Sub-Section
    const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found.",
      });
    }

    // Sub section update in section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: {
          subSection: deletedSubSection._id,
        },
      },
      { new: true }
    )
      .populate("Section", "subSection")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully.",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting Subsection.",
    });
  }
};
