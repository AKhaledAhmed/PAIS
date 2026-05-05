const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendPharmacyConfirmationEmail = async (pharmacy) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // You can change this later
      to: pharmacy.pharmacyEmail,
      subject: '✅ Pharmacy Registration Received',
      html: `<p>Dear ${pharmacy.pharmacyName}, your application is under review.</p>`
    });
    console.log("📬 Email sent via Resend!");
  } catch (error) {
    console.error("❌ Resend Error:", error.message);
  }
};

module.exports = { sendPharmacyConfirmationEmail };