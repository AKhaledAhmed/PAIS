const Notification = require("../models/notification");

// GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    // req.user comes from your protect middleware auth.js
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20); // Only get the last 20

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getMyNotifications, markAsRead };