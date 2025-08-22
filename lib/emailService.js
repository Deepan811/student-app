import nodemailer from "nodemailer"

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For development, you can use services like Gmail, Outlook, or email testing services
  // For production, use services like SendGrid, AWS SES, or Mailgun

  if (process.env.NODE_ENV === "development") {
    // Using Gmail for development (requires app password)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
      tls: {
        rejectUnauthorized: false, // Trust self-signed certificates in dev
      },
    })
  } else {
    // Production configuration - using SendGrid as example
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  }
}

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter()

    // Email options
    const mailOptions = {
      from: {
        name: "Student Management System",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log("Email sent successfully:", info.messageId)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

// Send welcome email template
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = "Welcome to Student Management System!"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Student Management System</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Student Management System!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for registering with our Student Management System. Your account has been created successfully and is currently pending approval from our administrators.</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your registration within 24-48 hours</li>
            <li>You'll receive an email notification once your account is approved</li>
            <li>After approval, you can log in and start exploring our courses</li>
          </ul>
          
          <p>We're excited to have you join our learning community!</p>
          
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/auth" class="button">Visit Our Platform</a>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
          <p>If you have any questions, please contact us at support@studentmanagement.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  })
}

// Send approval email template
export const sendApprovalEmail = async (userEmail, userName, password) => {
  const subject = "🎉 Your Account Has Been Approved!"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .password { font-size: 20px; font-weight: bold; color: #4338ca; letter-spacing: 1px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your account has been approved</p>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${userName}!</h2>
          <p>Great news! Your Student Management System account has been approved by our administrators. You can now log in using the following credentials:</p>
          
          <div class="credentials">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Password:</strong> <span class="password">${password}</span></p>
          </div>
          
          <p>If you have any questions or need assistance, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>Happy Learning!<br>The Student Management Team</p>
          <p>Need help? Contact us at support@studentmanagement.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  })
}

// Send rejection email template
export const sendRejectionEmail = async (userEmail, userName, reason = null) => {
  const subject = "Account Registration Update"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Thank you for your interest in joining our Student Management System. After careful review, we regret to inform you that we cannot approve your registration at this time.</p>
          
          ${
            reason
              ? `
          <div class="reason-box">
            <h3>Reason for decline:</h3>
            <p>${reason}</p>
          </div>
          `
              : ""
          }
          
          <p>If you believe this decision was made in error or if you have additional information that might help us reconsider, please don't hesitate to contact our support team.</p>
          
          <p>You're welcome to submit a new registration in the future if your circumstances change.</p>
          
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/contact" class="button">Contact Support</a>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
          <p>Questions? Contact us at support@studentmanagement.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  })
}

// Send password reset email template
export const sendPasswordResetEmail = async (userEmail, userName, resetToken, userType = "student") => {
  const subject = "Password Reset Request"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .token-box { background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .token { font-size: 24px; font-weight: bold; color: #1d4ed8; letter-spacing: 2px; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>You have requested to reset your password for your ${userType} account. Please use the following verification code to proceed with your password reset:</p>
          
          <div class="token-box">
            <p>Your verification code is:</p>
            <div class="token">${resetToken}</div>
          </div>
          
          <div class="warning">
            <h3>⚠️ Important Security Information:</h3>
            <ul>
              <li>This code will expire in <strong>10 minutes</strong></li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Contact support immediately if you suspect unauthorized access</li>
            </ul>
          </div>
          
          <p>To complete your password reset, return to the application and enter this verification code when prompted.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
          <p>Need help? Contact us at support@studentmanagement.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  })
}

// Send registration confirmation email template
export const sendRegistrationConfirmationEmail = async (userEmail, userName) => {
  const subject = "Registration Successful - Waiting for Approval"
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Successful!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for registering with our Student Management System. Your registration has been received successfully.</p>
          
          <div class="status-box">
            <h3>📋 Current Status: Waiting for Approval</h3>
            <p>Your account is currently pending review by our administrators.</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your registration within 24-48 hours</li>
            <li>You'll receive an email with your login credentials once approved</li>
            <li>After approval, you can log in and and start exploring our courses</li>
          </ul>
          
          <p>We appreciate your patience and look forward to welcoming you to our learning community!</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
          <p>Questions? Contact us at support@studentmanagement.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  })
}

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    
    return { success: true, message: "Email configuration is valid" }
  } catch (error) {
    console.error("❌ Email configuration error:", error)
    return { success: false, message: error.message }
  }
}

// Send welcome email with generated password
export const sendWelcomeEmailWithPassword = async (userEmail, userName, password) => {
  const subject = "Welcome to the Student Management System!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Student Management System</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .password { font-size: 20px; font-weight: bold; color: #4338ca; letter-spacing: 1px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${userName}!</h1>
        </div>
        <div class="content">
          <h2>Your account has been created.</h2>
          <p>An administrator has created an account for you on the Student Management System. Your account is currently pending approval.</p>
          <p>Here are your login details:</p>
          <div class="credentials">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Password:</strong> <span class="password">${password}</span></p>
          </div>
          <p>Please keep this password safe. You will be able to log in once your account is approved by an administrator.</p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/auth" class="button">Login to Your Account</a>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  });
};

export const sendAccountPendingEmail = async (userEmail, userName) => {
  const subject = "Your account is pending approval";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Pending Approval</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Account is Pending Approval</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>An administrator has created an account for you on the Student Management System. Your account is currently pending approval.</p>
          <p>You will receive another email with your login credentials once your account has been approved.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Student Management Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
  });
};