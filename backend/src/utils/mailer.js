const nodemailer = require('nodemailer');

/**
 * Mailer Utility - Handles sending emails (OTPs, notifications, etc.)
 */

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (options) => {
  try {
    // If SMTP credentials are not provided, log to console (for development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('--- MOCK EMAIL START ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text}`);
      console.log('--- MOCK EMAIL END ---');
      return { success: true, mock: true };
    }

    const mailOptions = {
      from: `"Secure Healthcare" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for Multi-Factor Authentication
 */
const sendOTP = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your Multi-Factor Authentication Code',
    text: `Your MFA code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50;">Multi-Factor Authentication</h2>
        <p>Your authentication code is:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3498db;">
          ${otp}
        </div>
        <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
          This code will expire in 10 minutes. If you did not request this, please change your password immediately.
        </p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendOTP
};
