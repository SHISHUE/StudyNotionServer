const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { videoUploadToCloudinary } = require("../utils/videoUploader");
//create Sub-Section
exports.createSubSection = async (req, res) => {
  try {
    //data fetch
    const { title, description, sectionId, videoDuration } = req.body;
    const video = req.files.videoFile;

    //validation
    if (!title || !description || !video || !sectionId || !videoDuration) {
      return res.status(400).json({
        success: false,
        message: "Fill all details",
      });
    }
    //video upload to cloundinary
    const videoUrl = await videoUploadToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //create Sub-Section
    const newSubSection = await SubSection.create({
      title: title,
      description: description,
      videoUrl: videoUrl.secure_url,
      timeDuration: videoDuration,
    });

    //Sub section update in section
     await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: newSubSection._id,
        },
      },
      { new: true }
    );

    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Subsection created successfully. ",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while creating Subsection.",
      error: error.message,
    });
  }
};

//update Sub-Section
exports.updateSubSection = async (req, res) => {
  try {
    //data fetch
    const { title, description, subSectionId, sectionId, videoDuration } = req.body;
    const video = req.files && req.files.videoFile;

    console.log("INSIDE OF UPATING SUBSECTION...", title, description, video );

    const subSection = await SubSection.findById(subSectionId)

    if(!subSection) {
      return res.status(404).json({
        success:false,
        message:  "SubSection Not found"
      })
    }

    if(title !== undefined) {
      subSection.title = title
    }
    if(description !== undefined) {
      subSection.description = description
    }
    if(videoDuration !== undefined) {
      subSection.timeDuration = videoDuration
    }
    
   if(video !== undefined) {
     //video upload to cloundinary
     const videoUrl = await videoUploadToCloudinary(
      video,
      process.env.FOLDER_NAME,
      {
        quality: "auto",
      }
    );

    subSection.videoUrl = videoUrl.secure_url
   }

   await subSection.save();

    const sectionData = await Section.findById(sectionId).populate("subSection")

    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully. ",
      data: sectionData,
    });
  }  catch (error) {
    console.error("Error updating subsection:", error.message);
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

    // Sub section update in section
      await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: {
          subSection: subSectionId,
        },
      },
      { new: true }
    )

    // delete Sub-Section
    const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found.",
      });
    }

    const updatedSection = await Section.findById(sectionId).populate("subSection")

    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully.",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting Subsection.",
    });
  }
};
