const express = require("express");
const router = express.Router();

const {
  createCourse,
  showAllCourses,
  getCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
  getFullDetailsOfCourse
} = require("../controller/Course");

const {
  showAllCategorys,
  createCategory,
  categoryPageDetails,
} = require("../controller/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controller/Subsection");

const {
  getAverageRating,
  getAllRating,
  createRating,
} = require("../controller/RatingAndReview");

const {
  auth,
  isInstructor,
  isAdmin,
  isStudent,
} = require("../middleware/auth");


const {updateCourseProgress} = require("../controller/CourseProgress")

router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/editCourse", auth, isInstructor, editCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);
router.delete("/deleteCourse", auth, isInstructor, deleteCourse);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getAllCourses", auth, isInstructor, showAllCourses);
router.post("/getCoursesDetails", getCourseDetails);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.post("/getAllCourseDetails", auth, isStudent, getFullDetailsOfCourse);

router.post("/createCategory", auth, isAdmin, createCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);
router.get("/showAllCategory", showAllCategorys);

// Rating and Review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

module.exports = router;
