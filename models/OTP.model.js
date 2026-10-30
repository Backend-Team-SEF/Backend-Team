
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    userData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    purpose: {
    type: String,
    enum: ["register", "password-reset"],
    default: "register",
    required: true,
},
  },
  { timestamps: true }
);

// حذف المستند بعد انتهاء صلاحيته
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// مستند OTP واحد لكل إيميل
otpSchema.index(
  { email: 1 },
  { unique: true }
);

module.exports = mongoose.model("OTP", otpSchema);
