const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Build or return a cached Nodemailer transporter.
 * Forces IPv4 to avoid ENETUNREACH errors on cloud platforms like Railway.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use real credentials from .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // 🚀 THE FIX: Force IPv4 and add timeouts to prevent hanging
      family: 4, 
      connectionTimeout: 15000, 
  greetingTimeout: 10000,
  socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false // Helps avoid issues with some SMTP servers
      }
    });
  } else {
    // Auto-generate Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      family: 4, // Added here for local consistency
    });
    console.log("📧  Ethereal test account created:", testAccount.user);
  }

  return transporter;
};

/**
 * Send a mock confirmation email to a newly registered pharmacy.
 */
const sendPharmacyConfirmationEmail = async (pharmacy) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: `"Pharma Platform" <${process.env.EMAIL_FROM || "no-reply@pharmaplatform.com"}>`,
      to: pharmacy.pharmacyEmail,
      subject: "✅ Pharmacy Registration Received – Application Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2e7d32;">Registration Received</h2>
          <p>Dear <strong>${pharmacy.pharmacyName}</strong>,</p>
          <p>Thank you for registering on the Pharma Platform. Your application has been received and is currently under review.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Application ID</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy.applicationId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Pharmacy Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy.pharmacyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">License ID</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy.licenseId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Status</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: #f57c00;"><strong>Pending Review</strong></td>
            </tr>
          </table>

          <p>Login credentials will be sent to this email once your application is approved by our team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Pharma Platform &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📬  Email preview URL:", previewUrl);
    }

    return previewUrl || null;
  } catch (error) {
    // Log the error but don't let it crash the registration process
    console.error("❌ Email sending failed:", error.message);
    return null;
  }
};

module.exports = { sendPharmacyConfirmationEmail };