exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
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
        <h2>Payment Success Confirmation</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your payment was successful. Thank you for your order.</p>
        <ul>
          <li><strong>Order ID:</strong> ${orderId}</li>
          <li><strong>Payment ID:</strong> ${paymentId}</li>
          <li><strong>Amount Paid:</strong> ${amount}</li>
        </ul>
       
        <p>If you have any questions or concerns regarding your order, please contact us.</p>
        <p>Thank you for choosing Study Notion's services!</p>
      </div>
      <footer>
        <p>&copy; 2023 Study Notion. All rights reserved.</p>
      </footer>
    </body>
    </html>`;
}
