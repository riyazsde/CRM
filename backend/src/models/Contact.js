const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: validator.isEmail
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 20
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    status: {
      type: String,
      enum: ["Lead", "Prospect", "Customer"],
      default: "Lead",
      index: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

contactSchema.index({ owner: 1, createdAt: -1 });
contactSchema.index({ owner: 1, email: 1 });
contactSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model("Contact", contactSchema);
