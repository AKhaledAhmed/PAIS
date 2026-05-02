const adminPharmacyService = require("../services/pharmacyaprovalService");

const updatePharmacyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const updatedPharmacy = await adminPharmacyService.changePharmacyStatus(id, status, reason);

    return res.status(200).json({
      success: true,
      message: `Pharmacy successfully ${status}.`,
      data: updatedPharmacy
    });

  } catch (error) {
    console.error("updatePharmacyStatus error:", error);
    if (error.message === "PHARMACY_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Pharmacy not found." });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  updatePharmacyStatus
};