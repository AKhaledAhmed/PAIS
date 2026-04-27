const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Inventory — junction between Pharmacy and Drug.
 * Each document = one drug stocked by one pharmacy.
 *
 * A pharmacy can only have one inventory entry per drug
 * (enforced by the compound unique index below).
 */
const inventorySchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: [true, "Pharmacy reference is required"],
      index: true,
    },
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drug",
      required: [true, "Drug reference is required"],
      index: true,
    },

    // ── Stock ──────────────────────────────────────────────────
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    // Convenience flag — frontend checks this first without computing quantity
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── Notes ──────────────────────────────────────────────────
    // e.g. "Refrigeration required", "Import only — limited supply"
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes must be under 300 characters"],
      default: null,
    },
  },
  { timestamps: true }
);

// ── One entry per drug per pharmacy ───────────────────────────
inventorySchema.index({ pharmacyId: 1, drugId: 1 }, { unique: true });

// ── Auto-set inStock based on quantity ────────────────────────
inventorySchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);