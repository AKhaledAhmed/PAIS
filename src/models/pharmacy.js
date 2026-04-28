const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const pharmacySchema = new mongoose.Schema(
  {
    // Auto-generated application reference ID
    applicationId: {
      type: String,
      default: () => `PHR-${uuidv4().split("-")[0].toUpperCase()}`,
      unique: true,
      index: true,
    },
    pharmacyName: {
      type: String,
      required: [true, "Pharmacy name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    // Correct GeoJSON format for MongoDB
    address: { 
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // MUST be an array: [lng, lat]
        required: [true, "Coordinates are required"],
      }
    },
    licenseId: {
      type: String,
      required: [true, "License ID is required"],
      unique: true,
      trim: true,
    },
    pharmacyEmail: {
      type: String,
      required: [true, "Pharmacy email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },
    acceptedTerms: {
      type: Boolean,
      required: [true, "You must accept the terms and conditions"],
      validate: {
        validator: (v) => v === true,
        message: "You must accept the terms and conditions",
      },
    },
    // E.164 format: +1234567890
    pharmacyPhone: {
      type: String,
      required: [true, "Pharmacy phone number is required"],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number in E.164 format"],
    },
    // Status managed off-site by admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Refresh tokens stored per device / session
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
// EDITED: Removed `next` argument as it is not used in Mongoose 5+ async hooks
pharmacySchema.pre("save", async function () {
  // 1. Only run if password exists and was modified
  // This prevents errors during initial "Pending" registration where password is null
  if (!this.password || !this.isModified("password")) return;

  try {
    // 2. Security requirement: Use a strong algorithm like bcrypt 
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    // EDITED: Throw the error so Mongoose can catch it instead of using next(err)
    throw err;
  }
});

// Enable 2dsphere index for distance-based ranking
pharmacySchema.index({ location: "2dsphere" });

// Helper method to check password during login
pharmacySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Pharmacy", pharmacySchema);