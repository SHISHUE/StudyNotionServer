const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");


exports.updateCourseProgress = async(req, res) => {
    const {courseId, subSectionId} = req.body;
    const userId = req.user.id;

    try {
        const subSection = await SubSection.findById(subSectionId);

        if(!subSection) {
            return res.json(404).json({
                success: false,
                message:"error invaild subSection"
            })
        }

        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId:userId
        })

        if(!courseProgress) {
            return res.json(404).json({
                success: false,
                message:"course progress not in subSection"
            })
        }else {
            if(courseProgress.completedVideos.includes(subSectionId)) {
                return res.json(400).json({
                    success: false,
                    message:"error subSection already completed"
                })
            }

            courseProgress.completedVideos.push(subSectionId);

        }

        await courseProgress.save()

        return res.status(200).json({
            success: true,
            message:"done progress"
        })

    } catch (error) {
        console.log("error", error.message)
        return res.json(500).json({
            success: false,
            message:"Internal server error"
        })
    }
}