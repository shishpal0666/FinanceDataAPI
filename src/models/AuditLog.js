const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    }, // like "CREATE_RECORD"
    entityType: {
      type: String,
      required: true,
    }, // like "FinancialRecord"
    entityId: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    }, // any extra info
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
