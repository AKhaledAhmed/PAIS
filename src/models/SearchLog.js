const mongoose = require("mongoose");

/**
 * SearchLog — records every drug search made on the platform.
 * Used for analytics (popular drugs, peak times, anonymous vs authenticated traffic).
 */
const searchLogSchema = new mongoose.Schema(
  {
    // The raw query string the user typed (e.g. "panadol", "amoxicillin")
    query: {
      type: String,
      required: [true, "Query is required"],
      trim: true,
      index: true,
    },

    // The client who searched — null if unauthenticated / anonymous
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },

    // IDs of drugs returned in the search results
    results: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Drug",
      default: [],
    },

    // How many results were returned (denormalised for quick analytics queries)
    resultCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // createdAt doubles as the search timestamp
    timestamps: true,
  }
);

module.exports = mongoose.model("SearchLog", searchLogSchema);