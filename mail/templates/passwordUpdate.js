exports.passwordUpdated = (name) => {
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
        <h2>Password Updated</h2>
        <p>Dear ${name},</p>
        <p>This is to inform you that your password has been successfully updated.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Thank you,<br>Study Notin</p>
      </div>
      <footer>
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </body>
    </html>
    `;
};
