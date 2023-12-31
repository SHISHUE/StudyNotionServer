const express = require("express");
const router = express.Router();

const {
  createCourse,
  showAllCourses,
  getCourseDetails,
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

router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getAllCourses", auth, isInstructor, showAllCourses);
router.get("/getCoursesDetails", auth, isInstructor, getCourseDetails);

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/getCategoryPageDetails", categoryPageDetails);
router.get("/showAllCategory", showAllCategorys);

// Rating and Review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
