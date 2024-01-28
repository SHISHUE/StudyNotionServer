const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const  crypto = require("crypto");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// payment initiate
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course Id" });
  }

  let totalAmount = 0;

  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the course" });
      }

      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student already enrolled" });
      }

      totalAmount += course.price;
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    return res.json({
      success: true,
      message: paymentResponse,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Could not initiate order" });
  }
};

//verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const reazorpay_payment_id = req?.body?.reazorpay_payment_id;
  const razorpay_signature = req?.body?.razorpay_signature;
  const courses = req?.body?.courses;
  const userId = req?.body?.user.id;

  if (
    !reazorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({
      success: false,
      message: "Payment Failded",
    });
  }

  let body = razorpay_order_id + "|" + reazorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    //enroll in course
    await enrolledStudent(courses, userId, res);

    return res.status(200).json({ success: true, message: "Payment Verified" });
  }

  return res.status(200).json({ success: false, message: "Payment Failded" });
};

const enrolledStudent = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide date for Courses or UserId",
    });
  }

  for (const courseId of courses) {
    try {
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, message: "Course Not found" });
      }

      const courseProgress = await CourseProgress.create({
        courseId: courseId,
        userId: userId,
        completedVideos: []
      })

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId, 
          courseProgress: courseProgress._id,
        } },
        { new: true }
      );

      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseTitle}`,
        courseEnrollmentEmail(
          enrolledCourse.courseTitle,
          `${enrolledStudent.firstName}`
        )
      );
      // console.log("Email send successfully", emailResponse);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the fields" });
  }

  try {
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not send mail" });
  }
};

//Capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//   try {
//     //get CourseId and user id
//     const { course_id } = req.body;
//     const userId = req.user.id;
//     //validation
//     if (!course_id || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "please provide valid info.",
//       });
//     }
//     //valid courseId
//     const course = await Course.findById(course_id);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found.",
//       });
//     }
//     // valid course
//     //user Already pay for the same course
//     const uid = new mongoose.Types.ObjectId(userId);
//     if (course.studentEnrolled.includes(uid)) {
//       return res.status(200).json({
//         success: false,
//         message: "user already buy this course",
//       });
//     }
//     //order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//       amount: amount * 100,
//       currency,
//       receipt: Math.random(Date.now()).toString(),
//       note: {
//         courseId: course_id,
//         userId,
//       },
//     };

//     try {
//       const paymentResponse = await instance.orders.create(options);
//       console.log(paymentResponse);
//       return res.status(200).json({
//         success: true,
//         courseName: course.courseName,
//         courseDescription: course.courseDescription,
//         thumbnail: course.thumbnail,
//         orderId: paymentResponse.id,
//         currency: paymentResponse.currency,
//         amount: paymentResponse.amount,
//       });
//     } catch (error) {
//       return res.json({
//         success: false,
//         message: "could not initiate order",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Erorr while completing payment.",
//     });
//   }
// };

// //Verify Signature of Razorpay and server
// exports.verifySignature = async (req, res) => {
//   try {
//     const webhookSecret = "12345";
//     const signature = req.header("x-razorpay-signature");

//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if (signature === digest) {
//       console.log("Payment is Authorize");

//       const { courseId, userId } = req.body.payload.payment.entity.notes;

//       try {
//         //fullfill the action

//         //find the course and enroll the student in it
//         const course = await Course.findByIdAndUpdate(
//           { _id: courseId },
//           {
//             $push: {
//               studentEnrolled: userId,
//             },
//           },
//           { new: true }
//         )
//           .populate("studentEnrolled")
//           .exec();

//         const user = await User.findByIdAndUpdate(
//           { _id: userId },
//           {
//             $push: {
//               courses: courseId,
//             },
//           },
//           { new: true }
//         )
//           .populate("courses")
//           .exec();

//         if (!course || !user) {
//           return res.status(500).json({
//             success: false,
//             message: "Course not found",
//           });
//         }

//         console.log(course, user);

//         await mailSender(
//           user.email,
//           "congratulations you are successfully enrolled into new study notion course. ",
//           courseEnrollmentEmail
//         );

//         return res.status(200).json({
//           success: true,
//           message: "Signature verified and course buy successfully",
//         });
//       } catch (error) {
//         return res.status(500).json({
//           success: false,
//           message: "error while updating user id and course id.",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "invalid request.",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "can't complete the payment internal issue occure.",
//     });
//   }
// };
