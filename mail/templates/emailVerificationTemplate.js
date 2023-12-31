exports.otpVerificationTemplate = (name, otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h2 {
          color: #333;
        }
    
        p {
          color: #555;
        }
    
        a {
          color: #007bff;
        }
    
        footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>OTP Verification</h2>
        <p>Dear ${name},</p>
        <p>Thank you for using our services. To complete your verification, please use the following One-Time Password (OTP):</p>
        <p><strong>${otp}</strong></p>
        <p>If you did not initiate this verification, please ignore this email.</p>
        <p>Best regards,<br>Study Notion</p>
      </div>
      <footer>
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </body>
    </html>
    `;
};
