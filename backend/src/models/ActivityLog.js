const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    contactName: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
