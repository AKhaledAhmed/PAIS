const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // The ID of the user receiving the notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel' // Tells Mongoose which model to look at
    },
    // Specifies if the recipient is a Client, Pharmacy, or Admin
    recipientModel: {
      type: String,
      required: true,
      enum: ['Client', 'Pharmacy', 'Admin']
    },
    type: {
      type: String,
      enum: ['STOCK_ALERT', 'SYSTEM_MSG', 'APPROVAL_STATUS', 'TICKET_UPDATE'],
      default: 'SYSTEM_MSG'
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);