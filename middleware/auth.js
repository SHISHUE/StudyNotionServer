const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
//auth
exports.auth = async (req, res, next) => {
  try {
    console.log("BEFORE TOKEN EXTRACTION ");
    // Token extraction
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header('Authorization').replace('Bearer ', '');

    console.log("After TOKEN EXTRACTION ", token);

    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // Verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something is not looking right while validating the token",
    });
  }
};



//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: " only for student",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verify",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: " only for Instructor",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verify",
    });
  }
};
//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: " only for Admin",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verify",
    });
  }
};
