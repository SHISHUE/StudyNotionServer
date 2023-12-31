const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//Capture the payment and initiate the Razorpay order

exports.capturePayment = async (req, res) => {
  try {
    //get CourseId and user id
    const { course_id } = req.body;
    const userId = req.user.id;
    //validation
    if (!course_id || !userId) {
      return res.status(400).json({
        success: false,
        message: "please provide valid info.",
      });
    }
    //valid courseId
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }
    // valid course
    //user Already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "user already buy this course",
      });
    }
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.floor(Math.random(Date.now()).toString()),
      note: {
        courseId: course_id,
        userId,
      },
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "could not initiate order",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erorr while completing payment.",
    });
  }
};

//Verify Signature of Razorpay and server
exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = "12345";
    const signature = req.header("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
      console.log("Payment is Authorize");

      const { courseId, userId } = req.body.payload.payment.entity.notes;

      try {
        //fullfill the action

        //find the course and enroll the student in it
        const course = await Course.findByIdAndUpdate(
          { _id: courseId },
          {
            $push: {
              studentEnrolled: userId,
            },
          },
          { new: true }
        )
          .populate("studentEnrolled")
          .exec();

        const user = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $push: {
              courses: courseId,
            },
          },
          { new: true }
        )
          .populate("courses")
          .exec();

        if (!course || !user) {
          return res.status(500).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log(course, user);

        await mailSender(
          user.email,
          "congratulations you are successfully enrolled into new study notion course. ",
          courseEnrollmentEmail
        );

        return res.status(200).json({
          success: true,
          message: "Signature verified and course buy successfully",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "error while updating user id and course id.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "invalid request.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "can't complete the payment internal issue occure.",
    });
  }
};
