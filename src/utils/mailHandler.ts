import nodemailer from "nodemailer";

const SENDER_EMAIL = process.env.SENDER_EMAIL
const MAIL_APP_PSWRD = process.env.MAIL_APP_PSWRD

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: MAIL_APP_PSWRD,
  },
});

const formatHtmlEmail = (title: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f6f6f6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .email-header {
      margin-bottom: 20px;
      text-align: center;
    }
    .email-logo {
      color: #5bb947;
    }
    .email-content {
      text-align: left;
      color: #333333;
      text-align: center;
    }
    .email-footer {
      margin-top: 20px;
      color: #999999;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h2 class="email-logo">eVenta</h2>
    </div>
    <div class="email-content">
      <h2>${title}</h2>
      <div>${message}</div>
    </div>
    <div class="email-footer">
      <hr style="border: 0; border-top: 1px solid #eee;">
      <p>This is an automated message, please do not reply. For any support please call 6655</p>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async ({
  email,
  subject,
  message,
  title,
}: {
  email: string;
  subject: string;
  message: string;
  title: string;
}) => {
  // Setup email data
  let mailOptions = {
    from: `eVenta(${SENDER_EMAIL})`,
    to: email,
    subject: subject,
    html: formatHtmlEmail(title, message),
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
