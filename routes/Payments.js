const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require('../controller/Payments');
const { auth, isInstructor, isStudent, isAdmin } = require('../middleware/auth');

// Use capturePayment route only for authenticated students
router.post('/capturePayment', auth, isStudent, capturePayment);

// Use verifySignature route without any specific authentication requirements
router.post('/verifyPayment',auth, isStudent, verifyPayment);

router.post('/sendPaymentSuccessEmail', auth, isStudent,sendPaymentSuccessEmail)

module.exports = router;
