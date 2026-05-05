const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: [true, "Query is required"],
      trim: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },
    // ✅ ADDED: Store the location of the search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: null,
      },
    },
    district: { 
      type: String, 
      index: true 
    },
    results: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Drug",
      default: [],
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Index for heatmaps/geospatial analytics
searchLogSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SearchLog", searchLogSchema);