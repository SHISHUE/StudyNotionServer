const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses
} = require('../controller/Profile');

// Delete profile route
router.delete('/deleteProfile', auth , deleteAccount);

// Update profile route - Requires authentication
router.put('/updateProfile', auth, updateProfile);

// Get user details route - Requires authentication
router.get('/getUserDetails', auth, getAllUserDetails);

// Get enrolled courses route - Requires authentication
router.get('/getEnrolledCourses', auth, getEnrolledCourses);

// Update display picture route - Requires authentication
router.put('/updateDisplayPicture', auth, updateDisplayPicture);

module.exports = router;
