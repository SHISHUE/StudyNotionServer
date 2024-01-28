const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

//create rating
exports.createRating = async (req, res) => {
  try {
    // fetch course
    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

    //validation
    if (!courseId || !rating || !review || !userId) {
      return res.status(400).json({
        success: false,
        message: "fill all fields",
      });
    }
    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "user not enrolled in course",
      });
    }
    // check if user already reviewes the course
    const checkReview = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (checkReview) {
      return res.status(403).json({
        success: false,
        message: "course is already reviewed by user",
      });
    }
    //fetch course details and create review
    const ratingAndreview = await RatingAndReview.create({
      rating: rating,
      review: review,
      course: courseId,
      user: userId,
    });

    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: ratingAndreview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "rating and review created successfully",
      data: ratingAndreview,
    });
  } catch (error) {
    console.log("error", error.message)
    return res.status(500).json({
      success: false,
      message: "rating not created",
      error: error.message
    });
  }
};

//getAverage Rating
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating ",
        average_rating: result[0].averageRating,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Average Rating is 0 , no rating give till now",
      average_rating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Getall Rating
exports.getAllRating = async (req, res) => {
  try {
    const allRatingAndReview = await RatingAndReview.find()
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseTitle",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All rating and review  successfully",
      data: allRatingAndReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "rating not find",
    });
  }
};
