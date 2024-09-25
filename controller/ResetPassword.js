const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    // Get email
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Fill all fields",
      });
    }

    // Check if the user exists
    const userExisting = await User.findOne({ email });

    if (!userExisting) {
      return res.status(401).json({
        success: false,
        message: "User not exist",
      });
    }

    // Generate token
    const token = crypto.randomUUID();

    // Update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        
          token: token,
          resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        
      },
      { new: true }
    );

    // Create URL
    const url = `https://study-notion-six-eta.vercel.app/update-password/${token}`;

    // Send mail
    await mailSender(email, "Password reset link", `Password Reset Link: ${url}`);

    return res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting the password.",
    });
  }
};


//Reset Password
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password not match enter again",
      });
    }
    //get user details
    const user = await User.findOne({ token: token });
    // if no entry - invaild token
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found ",
      });
    }
    // token time check
    if (user.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired",
      });
    }
    //hash pwd
    const hashedPassword = await bcrypt.hash(password, 10);
    //password update
    const updatedDetails = await User.findOneAndUpdate(
      { token: token },
      { 
        password: hashedPassword,
      }
     
    );
    return res.status(200).json({
      success: true,
      message: "Reset successfull",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      
      success: false,
      message: "Try again",
    });
  }
};
