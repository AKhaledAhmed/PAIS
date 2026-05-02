const Pharmacy = require("../models/pharmacy");
const Notification = require("../models/notification"); 
const { sendPharmacyConfirmationEmail } = require("../utils/emailMock"); 

const changePharmacyStatus = async (pharmacyId, status, reason) => {
  const pharmacy = await Pharmacy.findByIdAndUpdate(
    pharmacyId,
    { status },
    { new: true }
  );

  if (!pharmacy) {
    throw new Error("PHARMACY_NOT_FOUND");
  }

  // Generate In-App Notification
  const notificationContent = status === "approved" 
    ? "Congratulations! Your pharmacy registration has been approved. You can now log in."
    : `Your registration was rejected. Reason: ${reason || "Not provided."}`;

  await Notification.create({
    recipientId: pharmacy._id,
    recipientModel: 'Pharmacy',
    type: 'APPROVAL_STATUS',
    content: notificationContent
  });

  // Fire Email
  try {
    await sendPharmacyConfirmationEmail(pharmacy, status, reason); 
  } catch (emailErr) {
    console.error("Mock email error (non-fatal):", emailErr.message);
  }

  return pharmacy;
};

module.exports = {
  changePharmacyStatus
};