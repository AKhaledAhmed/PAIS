const dns = require('dns');
const nodemailer = require("nodemailer");

// 🚀 FIX 1: Force Node.js to prioritize IPv4 globally.
// This is the most effective way to stop the "ENETUNREACH" IPv6 error on Railway.
dns.setDefaultResultOrder('ipv4first');

let transporter = null;

/**
 * Build or return a cached Nodemailer transporter.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS; // 💡 Ensure this has NO SPACES in Railway Variables

  if (user && pass) {
    // 🚀 FIX 2: Use Port 465 (Implicit TLS)
    // Cloud providers like Railway often block Port 587. 465 is more reliable.
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,               
      secure: true,            // Must be true for Port 465
      auth: { user, pass },
      family: 4,               // 🚀 FIX 3: Force IPv4 within the socket connection
      connectionTimeout: 20000, 
      greetingTimeout: 20000,
      socketTimeout: 30000,
      debug: true,             // 🔍 Check Railway logs for detailed SMTP talk
      logger: true,            // 🔍 Logs the actual conversation with Gmail
      tls: {
        rejectUnauthorized: false, // Prevents drops from internal proxy certificates
        servername: "smtp.gmail.com"
      }
    });
  } else {
    // Fallback for local development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📧 Ethereal test account created:", testAccount.user);
  }

  return transporter;
};

/**
 * Send a confirmation email to a newly registered pharmacy.
 */
const sendPharmacyConfirmationEmail = async (pharmacy) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: `"Pharma Platform" <${process.env.SMTP_USER}>`,
      to: pharmacy.pharmacyEmail,
      subject: "✅ Pharmacy Registration Received",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2e7d32;">Registration Received</h2>
          <p>Dear <strong>${pharmacy.pharmacyName}</strong>,</p>
          <p>Your application (ID: ${pharmacy.applicationId}) is currently under review.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Pharma Platform &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    console.log("📬 Email sent successfully!");
    return nodemailer.getTestMessageUrl(info) || true;
  } catch (error) {
    // 🚀 FIX 4: Detailed logging to catch why it's failing in the background
    console.error("❌ Email Background Error:", error.message);
    if (error.code === 'ENETUNREACH') {
      console.error("DEBUG: Still hitting an IPv6 address or network is blocked.");
    }
    return null;
  }
};

module.exports = { sendPharmacyConfirmationEmail };