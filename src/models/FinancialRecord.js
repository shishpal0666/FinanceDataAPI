const mongoose = require("mongoose");

const FinancialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes for fast filtering
FinancialRecordSchema.index({ type: 1, date: -1 });
FinancialRecordSchema.index({ category: 1 });
FinancialRecordSchema.index({ isDeleted: 1 });
FinancialRecordSchema.index({ createdBy: 1 });

// Always exclude soft-deleted docs by default
// Note: Mongoose 9 query middleware does not pass next — use synchronous style
FinancialRecordSchema.pre(/^find/, function () {
  if (this._conditions.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

module.exports = mongoose.model("FinancialRecord", FinancialRecordSchema);
