
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}); 

transporter.verify()
  .then(() => console.log("SMTP Ready"))
  .catch((err) => console.error("SMTP Error:", err.message));

const sendOtpEmail = async (email, otp) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It expires in 5 minutes.`,
  });
};
const sendResetPasswordEmail = async (email, resetLink) => {
    return transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Reset Your Password",
        text: `Click this link to reset your password: ${resetLink}`,
    });
};

module.exports = { sendOtpEmail , sendResetPasswordEmail };
