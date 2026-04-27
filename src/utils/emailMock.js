const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Build or return a cached Nodemailer transporter.
 * If SMTP_USER/PASS are missing in .env, it auto-generates
 * an Ethereal test account — perfect for local testing.
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
    });
    console.log("📧  Ethereal test account created:", testAccount.user);
  }

  return transporter;
};

/**
 * Send a mock confirmation email to a newly registered pharmacy.
 *
 * @param {Object} pharmacy  - Pharmacy document from DB
 * @returns {string}          - Ethereal preview URL (or null for real SMTP)
 */
const sendPharmacyConfirmationEmail = async (pharmacy) => {
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
            <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy.applicationId}</td>
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
            <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Location</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Status</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #f57c00;"><strong>Pending Review</strong></td>
          </tr>
        </table>

        <p>Login credentials will be sent to this email once your application is approved by our team.</p>
        <p style="color: #777; font-size: 13px;">If you did not submit this registration, please ignore this email or contact support.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Pharma Platform &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
  });

  // For Ethereal: returns a URL to preview the email in browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📬  Email preview URL:", previewUrl);
  }

  return previewUrl || null;
};

module.exports = { sendPharmacyConfirmationEmail };
