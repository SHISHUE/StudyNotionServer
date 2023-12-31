exports.courseEnrollmentEmail = (courseName, name) => {
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
        <h2>Course Enrollment Confirmation</h2>
        <p>Dear ${name},</p>
        <p>We are excited to confirm your enrollment in the following course:</p>
        <ul>
          <li><strong>Course Name:</strong> ${courseName}</li>
          <li><strong>Start Date:</strong> ${Date.now()}</li>
          <li><strong>Duration:</strong> 3 months.</li>
        </ul>
       
       
        <p>If you have any questions or need further assistance, feel free to contact us.</p>
        <p>Best regards,<br>Study Notion</p>
      </div>
      <footer>
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </body>
    </html>
    `
}