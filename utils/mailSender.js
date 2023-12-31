const nodemailer = require("nodemailer");

require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "Study notain",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (error) {
    if (error) throw error;
  }
};

module.exports = mailSender;
